import { ApifyClient } from 'apify-client';

interface BoeAuction {
  subasta_id: string;
  estado_subasta: string;
  fecha_cierre: string;
  puja_minima_eur: number;
  valor_tasacion_eur: number;
  tramos_pujas_eur: number;
  importe_deposito_eur: number;
  cargas_detectadas: string;
  descripcion_cargas: string;
  score_inversion: string;
  score_descripcion: string;
  url_boe: string;
  referencia_catastral: string;
  catastro_disponible: string;
  uso_catastro: string;
  superficie_construida_m2: number | string;
  superficie_suelo_m2: number | string;
  antiguedad_ano: number | string;
  direccion_boe: string;
  direccion_catastro: string;
  provincia_boe: string;
  municipio_boe: string;
  descripcion_boe: string;
  coordenadas_gps: string;
  expediente_juzgado: string;
  expediente_numero: string;
  expediente_tipo: string;
  [key: string]: any;
}

const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_KEY,
});

export async function runBoeScraperProcess(): Promise<BoeAuction[]> {
  const actorId = process.env.APIFY_ACTOR_ID || 'olican/spain-subastas-boe-catastro';
  const maxResultados = 50;

  console.log(`[CSUBA-BOE] Starting Apify actor: ${actorId} (maxResultados: ${maxResultados})`);

  try {
    console.log(`[CSUBA-BOE] Calling Apify with input: { maxResults: ${maxResultados} }`);

    const run = await apifyClient.actor(actorId).call({
      maxResults: maxResultados
    });

    console.log(`[CSUBA-BOE] Actor run completed. Run ID: ${run.id}, Status: ${run.status}`);

    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();

    const auctions: BoeAuction[] = items as BoeAuction[];
    console.log(`[CSUBA-BOE] ✅ Scraped ${auctions.length} auctions from Apify`);

    if (auctions.length === 0) {
      console.warn(`[CSUBA-BOE] ⚠️ WARNING: Apify returned 0 auctions`);
      console.log(`[CSUBA-BOE] Dataset ID: ${run.defaultDatasetId}`);
    }

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
