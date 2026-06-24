import express, { Request, Response } from 'express';
import * as auctionService from '../services/auctions.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Public search
router.get('/search', async (req: Request, res: Response) => {
  try {
    const filters = {
      province: req.query.province as string,
      propertyType: req.query.propertyType as string,
      priceMax: req.query.priceMax ? Number(req.query.priceMax) : undefined,
      minimumBidMax: req.query.minimumBidMax ? Number(req.query.minimumBidMax) : undefined,
      areaMin: req.query.areaMin ? Number(req.query.areaMin) : undefined,
      auctionStatus: req.query.auctionStatus as string,
      occupancyStatus: req.query.occupancyStatus as string,
      investmentScore: req.query.investmentScore as string,
      search: req.query.search as string,
      sortBy: (req.query.sortBy as any) || 'date',
      limit: req.query.limit ? Number(req.query.limit) : 20,
      offset: req.query.offset ? Number(req.query.offset) : 0
    };

    const auctions = await auctionService.searchAuctions(filters);

    res.json({
      count: auctions.length,
      auctions
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
