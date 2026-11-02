import express, { Request, Response, NextFunction } from 'express';
import { waitUntil } from '@vercel/functions';
import * as auctionService from '../services/auctions.js';
import { authMiddleware } from '../middleware/auth.js';
import { runBoeScraperProcess, BoeSyncFilters } from '../scrapers/boe.js';
import { persistApifyAuctions } from '../services/apify.js';
import { getPool } from '../db/connection.js';
import { HttpError, clamp, isUuid, optNumber, optString } from '../validation.js';

const router = express.Router();

const MAX_LIMIT = 100;
const TIPOS_BIEN = ['inmueble', 'vehiculo', 'bien_mueble', 'todos'] as const;

const parsePaging = (q: any, defaultLimit = 50) => ({
  limit: clamp(Math.trunc(optNumber(q.limit ?? q.maxResultados, 'limit', 1) ?? defaultLimit), 1, MAX_LIMIT),
  offset: Math.trunc(optNumber(q.offset, 'offset', 0, 100000) ?? 0)
});

const requireUuid = (id: string) => {
  if (!isUuid(id)) throw new HttpError(404, 'Auction not found');
  return id;
};

// Public search with optional background refresh from Apify
router.get('/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = req.query;
    const { limit, offset } = parsePaging(q);
    const filters: auctionService.SearchFilters = {
      province: optString(q.province, 100),
      propertyType: optString(q.propertyType, 50),
      priceMax: optNumber(q.priceMax, 'priceMax'),
      minimumBidMax: optNumber(q.minimumBidMax, 'minimumBidMax'),
      minimumBidMin: optNumber(q.minimumBidMin, 'minimumBidMin'),
      areaMin: optNumber(q.areaMin, 'areaMin'),
      auctionStatus: optString(q.auctionStatus, 50),
      occupancyStatus: optString(q.occupancyStatus, 50),
      investmentScore: optString(q.investmentScore, 20),
      search: optString(q.search, 100),
      sortBy: optString(q.sortBy, 30) || 'pricePerM2',
      limit,
      offset
    };

    const tipoBienRaw = optString(q.tipoBien, 20);
    const tipoBien = TIPOS_BIEN.includes(tipoBienRaw as any) ? (tipoBienRaw as BoeSyncFilters['tipoBien']) : undefined;

    const auctions = await auctionService.searchAuctions(filters);

    // Opt-in via APIFY_SYNC_ENABLED (off while the Apify account has no credits).
    const syncEnabled = process.env.APIFY_SYNC_ENABLED === 'true';
    let syncStatus = 'sync-disabled';
    if (syncEnabled) {
      const started = startSync({
        tipoBien,
        province: filters.province,
        minimumBidMax: filters.minimumBidMax,
        investmentScore: filters.investmentScore,
        maxResultados: limit
      });
      syncStatus = started ? 'searching-in-background' : 'recently-synced';
    }

    res.json({ count: auctions.length, auctions, syncStatus, syncTimestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
});

// Each distinct filter combination triggers at most one Apify run per cooldown
// window, so repeated searches don't burn credits.
const SYNC_COOLDOWN_MS = 30 * 60 * 1000;
const lastSync = new Map<string, number>();

function startSync(filters: BoeSyncFilters): boolean {
  const key = JSON.stringify(filters);
  const now = Date.now();
  if ((lastSync.get(key) ?? 0) + SYNC_COOLDOWN_MS > now) return false;
  lastSync.set(key, now);

  // waitUntil keeps the Vercel function alive until the sync finishes; outside
  // Vercel the promise simply runs in the background.
  waitUntil(
    syncApify(filters).catch((err) => console.warn('[SEARCH-SYNC] Background sync error:', err.message))
  );
  return true;
}

async function syncApify(filters: BoeSyncFilters) {
  console.log('[SEARCH-SYNC] Starting background sync from Apify with filters:', filters);
  const auctions = await runBoeScraperProcess(filters);
  if (auctions.length > 0) {
    const result = await persistApifyAuctions(getPool(), auctions, `run_${Date.now()}`);
    console.log(`[SEARCH-SYNC] ✅ Synced ${result.count} auctions from Apify (${result.skipped} skipped)`);
  } else {
    console.log('[SEARCH-SYNC] ⚠️ Apify returned 0 results');
  }
}

// Protected routes (require auth). Declared before /:id for readability; the
// paths don't overlap because /:id is a single segment.

router.get('/watchlist/my-list', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit, offset } = parsePaging(req.query);
    const watchlist = await auctionService.getUserWatchlist(req.userId!, limit, offset);
    res.json({ count: watchlist.length, watchlist });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await auctionService.getAuctionById(requireUuid(req.params.id)));
  } catch (error) {
    next(error);
  }
});

router.get('/:id/watchlist', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const inWatchlist = await auctionService.isInWatchlist(req.userId!, requireUuid(req.params.id));
    res.json({ inWatchlist });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/watchlist', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notes = optString(req.body?.notes, 2000);
    const result = await auctionService.addToWatchlist(req.userId!, requireUuid(req.params.id), notes);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id/watchlist', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await auctionService.removeFromWatchlist(req.userId!, requireUuid(req.params.id)));
  } catch (error) {
    next(error);
  }
});

export default router;
