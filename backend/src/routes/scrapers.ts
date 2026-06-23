import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

/**
 * POST /api/scrapers/boe/test
 * Test BOE scraper - executes and returns sample auctions
 */
router.post('/boe/test', async (req, res) => {
  try {
    console.log('[API] BOE Scraper test endpoint called');

    const BOE_PATH = path.join(
      process.cwd(),
      '..',
      '..',
      'scrapers',
      'boe'
    );

    console.log(`[API] BOE path: ${BOE_PATH}`);

    // Execute Python scraper
    const pythonExe = 'C:/Users/yos/AppData/Local/Programs/Python/Python312/python.exe';
    const python = spawn(pythonExe, ['scraper_simple.py'], {
      cwd: BOE_PATH,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    python.stdout?.on('data', (data) => {
      stdout += data.toString();
      console.log(`[BOE-OUT] ${data.toString().trim()}`);
    });

    python.stderr?.on('data', (data) => {
      stderr += data.toString();
      console.error(`[BOE-ERR] ${data.toString().trim()}`);
    });

    // Wait for process to complete
    const result = await new Promise((resolve, reject) => {
      python.on('close', (code) => {
        if (code === 0) {
          resolve({ code, stdout, stderr });
        } else {
          reject(new Error(`Scraper exited with code ${code}`));
        }
      });

      python.on('error', (err) => {
        reject(err);
      });

      // Timeout after 2 minutes
      setTimeout(() => {
        python.kill();
        reject(new Error('Scraper timeout (2 minutes)'));
      }, 120000);
    });

    // Parse output
    try {
      // Extract JSON from stdout (last part should be JSON)
      const jsonMatch = stdout.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const auctions = JSON.parse(jsonMatch[0]);
        return res.json({
          status: 'success',
          timestamp: new Date().toISOString(),
          count: auctions.length,
          auctions: auctions.slice(0, 5), // Return first 5 as sample
          message: `✅ Successfully scraped ${auctions.length} auctions from BOE`,
        });
      } else {
        return res.json({
          status: 'partial_success',
          timestamp: new Date().toISOString(),
          count: 0,
          auctions: [],
          message: '⚠️  Scraper ran but no auctions found in this URL',
          output: stdout.substring(0, 500),
        });
      }
    } catch (parseError) {
      console.error('[API] Parse error:', parseError);
      return res.json({
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Failed to parse scraper output',
        output: stdout.substring(0, 500),
      });
    }
  } catch (error) {
    console.error('[API] Scraper error:', error);
    return res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * GET /api/scrapers/status
 * Check scraper status and configuration
 */
router.get('/status', (req, res) => {
  const BOE_PATH = path.join(
    process.cwd(),
    '..',
    '..',
    'scrapers',
    'boe'
  );

  res.json({
    status: 'ready',
    timestamp: new Date().toISOString(),
    scraper: {
      name: 'BOE Auction Scraper',
      language: 'Python 3.12',
      location: BOE_PATH,
      status: 'configured',
      last_run: null,
      next_test_endpoint: 'POST /api/scrapers/boe/test',
    },
    endpoints: {
      test: 'POST /api/scrapers/boe/test - Execute scraper and get sample data',
      status: 'GET /api/scrapers/status - Check scraper configuration',
    },
  });
});

export default router;
