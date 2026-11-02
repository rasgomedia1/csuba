import { ApifyClient } from 'apify-client';

export interface BoeAuction {
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

// INE province codes expected by the Apify actor's `provincia` input field
export const PROVINCE_CODES: Record<string, string> = {
  'Álava': '01', 'Albacete': '02', 'Alicante': '03', 'Almería': '04', 'Ávila': '05',
  'Badajoz': '06', 'Baleares': '07', 'Illes Balears': '07', 'Palma': '07',
  'Barcelona': '08', 'Burgos': '09', 'Cáceres': '10', 'Cádiz': '11', 'Castellón': '12',
  'Ciudad Real': '13', 'Córdoba': '14', 'A Coruña': '15', 'Cuenca': '16', 'Girona': '17',
  'Granada': '18', 'Guadalajara': '19', 'Guipúzcoa': '20', 'Gipuzkoa': '20', 'Huelva': '21',
  'Huesca': '22', 'Jaén': '23', 'León': '24', 'Lleida': '25', 'La Rioja': '26', 'Lugo': '27',
  'Madrid': '28', 'Málaga': '29', 'Murcia': '30', 'Navarra': '31', 'Ourense': '32',
  'Asturias': '33', 'Palencia': '34', 'Las Palmas': '35', 'Pontevedra': '36', 'Salamanca': '37',
  'Santa Cruz de Tenerife': '38', 'Cantabria': '39', 'Segovia': '40', 'Sevilla': '41',
  'Soria': '42', 'Tarragona': '43', 'Teruel': '44', 'Toledo': '45', 'Valencia': '46',
  'Valladolid': '47', 'Vizcaya': '48', 'Bizkaia': '48', 'Bilbao': '48', 'Zamora': '49',
  'Zaragoza': '50', 'Ceuta': '51', 'Melilla': '52',
};

export interface BoeSyncFilters {
  tipoBien?: 'inmueble' | 'vehiculo' | 'bien_mueble' | 'todos';
  province?: string;
  minimumBidMax?: number;
  investmentScore?: string;
  maxResultados?: number;
}

export async function runBoeScraperProcess(filters: BoeSyncFilters = {}): Promise<BoeAuction[]> {
  const actorId = process.env.APIFY_ACTOR_ID || 'olican/spain-subastas-boe-catastro';

  const input: Record<string, any> = {
    maxResultados: Math.min(filters.maxResultados ?? 50, 50),
  };

  if (filters.tipoBien) {
    input.tipoBien = filters.tipoBien;
  }

  if (filters.province) {
    const provinciaCode = PROVINCE_CODES[filters.province];
    if (provinciaCode) input.provincia = provinciaCode;
  }

  if (filters.minimumBidMax !== undefined) {
    input.precioMaximo = filters.minimumBidMax;
  }

  if (filters.investmentScore) {
    input.scoreMinimo = filters.investmentScore;
  }

  console.log(`[CSUBA-BOE] Starting Apify actor: ${actorId} with input:`, input);

  try {
    const run = await apifyClient.actor(actorId).call(input);

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
