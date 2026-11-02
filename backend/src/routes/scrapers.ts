import express, { Request, Response, NextFunction } from 'express';
import { runBoeScraperProcess } from '../scrapers/boe.js';
import { persistApifyAuctions } from '../services/apify.js';
import { getPool } from '../db/connection.js';
import { adminMiddleware } from '../middleware/auth.js';

// Every endpoint here starts a paid Apify run, so the whole router is
// admin-only (header x-admin-token = ADMIN_TOKEN).
const router = express.Router();
router.use(adminMiddleware);

router.get('/status', (req: Request, res: Response) => {
  res.json({
    status: 'ready',
    timestamp: new Date().toISOString(),
    scraper: {
      name: 'BOE Auction Scraper (Apify)',
      actor_id: process.env.APIFY_ACTOR_ID || 'olican/spain-subastas-boe-catastro',
      api_key: process.env.APIFY_API_KEY ? 'configured' : 'missing',
      auto_sync: process.env.APIFY_SYNC_ENABLED === 'true'
    }
  });
});

// Runs the actor and returns a sample without touching the database.
router.post('/boe/test', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auctions = await runBoeScraperProcess({ maxResultados: 5 });
    res.json({ status: 'success', count: auctions.length, sample: auctions.slice(0, 3) });
  } catch (error) {
    next(error);
  }
});

// Runs the actor and upserts the results into PostgreSQL.
router.post('/boe/sync-to-db', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auctions = await runBoeScraperProcess();
    const apifyRunId = `run_${Date.now()}`;
    const result = await persistApifyAuctions(getPool(), auctions, apifyRunId);
    res.json({ status: 'success', apifyRunId, count: result.count, skipped: result.skipped });
  } catch (error) {
    next(error);
  }
});

export default router;
