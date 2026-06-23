import { ApifyClient } from 'apify-client';

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

const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_KEY,
});

export async function runBoeScraperProcess(): Promise<BoeAuction[]> {
  const actorId = process.env.APIFY_ACTOR_ID || 'olican/spain-subastas-boe-catastro';

  console.log(`[CSUBA-BOE] Starting Apify actor: ${actorId}`);

  try {
    const run = await apifyClient.actor(actorId).call();

    console.log(`[CSUBA-BOE] Actor run completed. Run ID: ${run.id}`);

    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();

    const auctions: BoeAuction[] = items as BoeAuction[];
    console.log(`[CSUBA-BOE] Successfully scraped ${auctions.length} auctions`);

    return auctions;
  } catch (error) {
    console.error(`[CSUBA-BOE] Error: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

export async function syncBoeAuctions(): Promise<{ count: number; auctions: BoeAuction[] }> {
  try {
    console.log('[CSUBA-BOE] Starting BOE auction sync...');

    const auctions = await runBoeScraperProcess();

    if (!auctions || auctions.length === 0) {
      console.warn('[CSUBA-BOE] No auctions scraped');
      return { count: 0, auctions: [] };
    }

    console.log(`[CSUBA-BOE] Sync complete: ${auctions.length} auctions`);
    return { count: auctions.length, auctions };
  } catch (error) {
    console.error(`[CSUBA-BOE] Sync failed: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

export async function testBoeScraperEndpoint(): Promise<any> {
  try {
    console.log('[CSUBA-BOE] Test endpoint called');
    const auctions = await runBoeScraperProcess();
    return {
      status: 'success',
      timestamp: new Date().toISOString(),
      count: auctions.length,
      sample: auctions.slice(0, 3),
      message: `Scraped ${auctions.length} auctions from BOE via Apify`,
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
