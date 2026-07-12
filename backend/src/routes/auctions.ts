import express, { Request, Response } from 'express';
import * as auctionService from '../services/auctions.js';
import { authMiddleware } from '../middleware/auth.js';
import { runBoeScraperProcess, BoeSyncFilters } from '../scrapers/boe.js';
import { persistApifyAuctions } from '../services/apify.js';
import { db } from '../db/index.js';

const router = express.Router();

// Public search with non-blocking auto-sync from Apify
router.get('/search', async (req: Request, res: Response) => {
  try {
    const filters = {
      province: req.query.province as string,
      propertyType: req.query.propertyType as string,
      priceMax: req.query.priceMax ? Number(req.query.priceMax) : undefined,
      minimumBidMax: req.query.minimumBidMax ? Number(req.query.minimumBidMax) : undefined,
      minimumBidMin: req.query.minimumBidMin ? Number(req.query.minimumBidMin) : undefined,
      areaMin: req.query.areaMin ? Number(req.query.areaMin) : undefined,
      auctionStatus: req.query.auctionStatus as string,
      occupancyStatus: req.query.occupancyStatus as string,
      investmentScore: req.query.investmentScore as string,
      search: req.query.search as string,
      sortBy: (req.query.sortBy as any) || 'pricePerM2',
      limit: req.query.maxResultados ? Number(req.query.maxResultados) : (req.query.limit ? Number(req.query.limit) : 50),
      offset: req.query.offset ? Number(req.query.offset) : 0
    };

    const tipoBien = req.query.tipoBien as BoeSyncFilters['tipoBien'];

    // Get cached results immediately
    const auctions = await auctionService.searchAuctions(filters);

    // The Apify background sync is opt-in via APIFY_SYNC_ENABLED. It is disabled
    // by default because the Apify account has no remaining credits, so every
    // actor call would only fail (and slow responses down) without refreshing data.
    const syncEnabled = process.env.APIFY_SYNC_ENABLED === 'true';
    if (syncEnabled) {
      // Non-blocking, scoped to the same filters the actor accepts
      syncApifyInBackground({
        tipoBien,
        province: filters.province,
        minimumBidMax: filters.minimumBidMax,
        investmentScore: filters.investmentScore,
        maxResultados: filters.limit
      }).catch(err => console.warn('[SEARCH-SYNC] Background sync error:', err.message));
    }

    res.json({
      count: auctions.length,
      auctions,
      syncStatus: syncEnabled ? 'searching-in-background' : 'sync-disabled',
      syncTimestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Background sync function (non-blocking)
async function syncApifyInBackground(filters: BoeSyncFilters) {
  try {
    console.log('[SEARCH-SYNC] Starting background sync from Apify with filters:', filters);
    const auctions = await runBoeScraperProcess(filters);

    if (auctions && auctions.length > 0) {
      const apifyRunId = `run_${Date.now()}`;
      const persistResult = await persistApifyAuctions(db.pool!, auctions as any, apifyRunId);
      console.log(`[SEARCH-SYNC] ✅ Synced ${persistResult.count} auctions from Apify`);
    } else {
      console.log('[SEARCH-SYNC] ⚠️ Apify returned 0 results');
    }
  } catch (syncError: any) {
    console.warn(`[SEARCH-SYNC] ⚠️ Error: ${syncError.message}`);
  }
}

// Get auction details
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const auction = await auctionService.getAuctionById(req.params.id);
    res.json(auction);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

// Protected routes (require auth)

// Get user watchlist
router.get('/watchlist/my-list', authMiddleware, async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const offset = req.query.offset ? Number(req.query.offset) : 0;

    const watchlist = await auctionService.getUserWatchlist(req.userId!, limit, offset);

    res.json({
      count: watchlist.length,
      watchlist
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add to watchlist
router.post('/:id/watchlist', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { notes } = req.body;
    const result = await auctionService.addToWatchlist(req.userId!, req.params.id, notes);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Remove from watchlist
router.delete('/:id/watchlist', authMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await auctionService.removeFromWatchlist(req.userId!, req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
