import express from 'express';
import { testBoeScraperEndpoint, syncBoeAuctions } from '../scrapers/boe.js';

const router = express.Router();

router.post('/boe/test', async (req, res) => {
  try {
    console.log('[API] BOE Scraper test endpoint called');
    const result = await testBoeScraperEndpoint();
    return res.json(result);
  } catch (error) {
    console.error('[API] Scraper error:', error);
    return res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

router.post('/boe/sync', async (req, res) => {
  try {
    console.log('[API] BOE Scraper sync endpoint called');
    const result = await syncBoeAuctions();
    return res.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      ...result,
      message: `✅ Synced ${result.count} auctions from BOE via Apify`,
    });
  } catch (error) {
    console.error('[API] Sync error:', error);
    return res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

router.get('/status', (req, res) => {
  res.json({
    status: 'ready',
    timestamp: new Date().toISOString(),
    scraper: {
      name: 'BOE Auction Scraper (Apify)',
      type: 'Apify Actor',
      actor_id: process.env.APIFY_ACTOR_ID || 'olican/spain-subastas-boe-catastro',
      status: 'configured',
      api_key: process.env.APIFY_API_KEY ? '***configured***' : '***missing***',
    },
    endpoints: {
      test: 'POST /api/scrapers/boe/test - Execute scraper and get sample data',
      sync: 'POST /api/scrapers/boe/sync - Sync scraped data to database',
      status: 'GET /api/scrapers/status - Check scraper configuration',
    },
  });
});

export default router;
