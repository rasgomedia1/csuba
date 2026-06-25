import express, { Request, Response } from 'express';
import * as auctionService from '../services/auctions.js';
import { authMiddleware } from '../middleware/auth.js';
import { runBoeScraperProcess } from '../scrapers/boe.js';
import { persistApifyAuctions } from '../services/apify.js';
import { db } from '../db/index.js';

const router = express.Router();

// Public search with auto-sync from Apify
router.get('/search', async (req: Request, res: Response) => {
  try {
    // Auto-sync fresh data from Apify before searching
    console.log('[SEARCH] Starting auto-sync from Apify...');
    try {
      const auctions = await runBoeScraperProcess();
      if (auctions && auctions.length > 0) {
        const apifyRunId = `run_${Date.now()}`;
        const persistResult = await persistApifyAuctions(db.pool!, auctions as any, apifyRunId);
        console.log(`[SEARCH] ✅ Synced ${persistResult.count} auctions from Apify`);
      } else {
        console.log('[SEARCH] ⚠️ Apify returned no auctions');
      }
    } catch (syncError: any) {
      console.warn(`[SEARCH] ⚠️ Apify sync warning (continuing with existing data): ${syncError.message}`);
      // Continue with search anyway - don't fail if Apify fails
    }

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
      limit: req.query.limit ? Number(req.query.limit) : 50,
      offset: req.query.offset ? Number(req.query.offset) : 0
    };

    const auctions = await auctionService.searchAuctions(filters);

    res.json({
      count: auctions.length,
      auctions,
      syncTimestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

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
