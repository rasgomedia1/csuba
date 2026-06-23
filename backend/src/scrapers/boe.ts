/**
 * CSUBA - BOE Scraper Integration
 * Wrapper para ejecutar el scraper BOE (Python) desde Node.js
 *
 * El scraper real está en /scrapers/boe/app/getData.py
 * Este archivo lo ejecuta y parsea el output
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

interface BoeAuction {
  IDENTIFICADOR: string;
  TITULO: string;
  PROVINCIA: string;
  PRECIO_PUJA: number;
  TASACION: number;
  CANTIDAD_RECLAMADA?: number;
  URL?: string;
  [key: string]: any;
}

export async function runBoeScraperProcess(): Promise<BoeAuction[]> {
  const BOE_SCRAPER_PATH = path.join(
    __dirname,
    '../../..',
    'scrapers',
    'boe'
  );

  console.log(`[CSUBA-BOE] Starting scraper at ${BOE_SCRAPER_PATH}`);

  return new Promise((resolve, reject) => {
    // Configurar environment variables para el scraper Python
    const env = {
      ...process.env,
      DROPBOX_KEY: process.env.BOE_DROPBOX_KEY || '',
      EMAIL_USER: process.env.BOE_EMAIL_USER || '',
      EMAIL_PASSWORD: process.env.BOE_EMAIL_PASSWORD || '',
      BOE_EMAIL: process.env.BOE_EMAIL || '',
      BOE_PASSWORD: process.env.BOE_PASSWORD || '',
      PYTHONPATH: BOE_SCRAPER_PATH,
      PYTHONUNBUFFERED: '1',
    };

    // Ejecutar el scraper Python
    const python = spawn('python', ['app/getData.py'], {
      cwd: BOE_SCRAPER_PATH,
      env,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    python.stdout?.on('data', (data) => {
      stdout += data.toString();
      console.log(`[CSUBA-BOE-OUT] ${data.toString().trim()}`);
    });

    python.stderr?.on('data', (data) => {
      stderr += data.toString();
      console.error(`[CSUBA-BOE-ERR] ${data.toString().trim()}`);
    });

    python.on('error', (error) => {
      console.error(`[CSUBA-BOE] Process error: ${error.message}`);
      reject(new Error(`BOE scraper process error: ${error.message}`));
    });

    python.on('close', (code) => {
      if (code !== 0) {
        console.error(`[CSUBA-BOE] Process exited with code ${code}`);
        reject(new Error(`BOE scraper exited with code ${code}: ${stderr}`));
        return;
      }

      try {
        // Parsear output JSON
        // El scraper debería output JSON al stdout
        if (!stdout) {
          console.warn('[CSUBA-BOE] No output from scraper');
          resolve([]);
          return;
        }

        // Buscar JSON en el output (puede haber logs antes)
        const jsonMatch = stdout.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.warn('[CSUBA-BOE] No JSON found in output');
          resolve([]);
          return;
        }

        const auctions: BoeAuction[] = JSON.parse(jsonMatch[0]);
        console.log(
          `[CSUBA-BOE] Successfully scraped ${auctions.length} auctions`
        );
        resolve(auctions);
      } catch (error) {
        console.error(`[CSUBA-BOE] JSON parse error: ${error}`);
        reject(
          new Error(`Failed to parse BOE scraper output: ${error instanceof Error ? error.message : String(error)}`)
        );
      }
    });

    // Timeout después de 5 minutos
    const timeout = setTimeout(() => {
      python.kill('SIGKILL');
      reject(new Error('BOE scraper timeout (5 minutes)'));
    }, 5 * 60 * 1000);

    python.on('exit', () => clearTimeout(timeout));
  });
}

/**
 * Ejecutar scraper y guardar en base de datos
 */
export async function syncBoeAuctions(query: any): Promise<{ count: number; auctions: BoeAuction[] }> {
  try {
    console.log('[CSUBA-BOE] Starting BOE auction sync...');

    // Ejecutar scraper
    const auctions = await runBoeScraperProcess();

    if (!auctions || auctions.length === 0) {
      console.warn('[CSUBA-BOE] No auctions scraped');
      return { count: 0, auctions: [] };
    }

    // TODO: Guardar en PostgreSQL en fase siguiente
    // for (const auction of auctions) {
    //   await query(
    //     `INSERT INTO auctions (...) VALUES (...)`,
    //     [...]
    //   );
    // }

    console.log(`[CSUBA-BOE] Sync complete: ${auctions.length} auctions`);
    return { count: auctions.length, auctions };
  } catch (error) {
    console.error(
      `[CSUBA-BOE] Sync failed: ${error instanceof Error ? error.message : String(error)}`
    );
    throw error;
  }
}

/**
 * Test endpoint: Ejecutar scraper y retornar raw output
 */
export async function testBoeScraperEndpoint(): Promise<any> {
  try {
    console.log('[CSUBA-BOE] Test endpoint called');
    const auctions = await runBoeScraperProcess();
    return {
      status: 'success',
      timestamp: new Date().toISOString(),
      count: auctions.length,
      sample: auctions.slice(0, 3), // Retornar primeras 3 como sample
      message: `Scraped ${auctions.length} auctions from BOE`,
    };
  } catch (error) {
    console.error(`[CSUBA-BOE] Test failed: ${error}`);
    return {
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
