import { Pool } from 'pg';
import { PROVINCE_CODES, type BoeAuction } from '../scrapers/boe.js';

// INE code ("12" or "5") → first province name registered for that code.
const PROVINCE_BY_CODE: Record<string, string> = {};
for (const [name, code] of Object.entries(PROVINCE_CODES)) PROVINCE_BY_CODE[code] ??= name;

const provinceName = (v: unknown): string | null => {
  const s = text(v);
  if (s && /^\d{1,2}$/.test(s)) return PROVINCE_BY_CODE[s.padStart(2, '0')] ?? s;
  return s;
};

const NO_CONSTA = 'No consta';

const text = (v: unknown): string | null => {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s && s !== NO_CONSTA ? s : null;
};

const num = (v: unknown): number | null => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  const s = text(v);
  if (!s) return null;
  const n = parseFloat(s.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

const int = (v: unknown): number | null => {
  const n = num(v);
  return n === null ? null : Math.trunc(n);
};

const yes = (v: unknown) => text(v)?.toLowerCase() === 'sí' || text(v)?.toLowerCase() === 'si';

// "lat, lng" → both numbers within valid ranges, or nulls.
function parseGps(v: unknown): [number | null, number | null] {
  const s = text(v);
  if (!s) return [null, null];
  const [lat, lng] = s.split(',').map((c) => parseFloat(c.trim()));
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return [null, null];
  }
  return [lat, lng];
}

function mapPropertyType(uso: unknown): string {
  const u = text(uso)?.toLowerCase();
  if (!u) return 'Otro';
  if (u.includes('residencial') || u.includes('vivienda')) return 'Vivienda';
  if (u.includes('comercial') || u.includes('local')) return 'Local';
  if (u.includes('garaje') || u.includes('estacionamiento') || u.includes('aparcamiento')) return 'Garaje';
  if (u.includes('terreno') || u.includes('suelo')) return 'Terreno';
  return 'Otro';
}

export async function persistApifyAuctions(pool: Pool, auctions: BoeAuction[], apifyRunId: string) {
  console.log(`[APIFY] Persistiendo ${auctions.length} subastas en PostgreSQL`);
  let count = 0;
  let skipped = 0;

  // One bad record must not abort the whole batch.
  for (const auction of auctions) {
    try {
      if (!text(auction.subasta_id)) {
        skipped++;
        continue;
      }
      await persistSingleAuction(pool, auction, apifyRunId);
      count++;
    } catch (error) {
      skipped++;
      console.error(`[APIFY] ❌ Error persistiendo ${auction.subasta_id}:`, (error as Error).message);
    }
  }

  console.log(`[APIFY] ✅ ${count} persistidas, ${skipped} omitidas`);
  return { success: true, count, skipped };
}

async function persistSingleAuction(pool: Pool, a: BoeAuction, apifyRunId: string) {
  const [lat, lng] = parseGps(a.coordenadas_gps);
  const description = text(a.descripcion_boe);
  const title = (description ?? text(a.direccion_boe) ?? `Subasta ${a.subasta_id}`).substring(0, 500);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Full upsert: a re-scraped auction refreshes prices, status and dates too,
    // not just the score.
    const auctionResult = await client.query(
      `INSERT INTO auctions (
        external_id, source, title, description,
        property_type, province, municipality,
        price_initial, price_estimate, minimum_bid_eur, valor_tasacion_eur, importe_deposito_eur,
        auction_status, auction_end, occupancy_status,
        investment_score, investment_score_description,
        charges_detected, charges_description, legal_charges_description, url
      ) VALUES ($1,'boe',$2,$3,$4,$5,$6,$7,$8,$7,$8,$9,$10,$11,'unknown',$12,$13,$14,$15,$15,$16)
      ON CONFLICT (external_id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        property_type = EXCLUDED.property_type,
        province = EXCLUDED.province,
        municipality = EXCLUDED.municipality,
        price_initial = EXCLUDED.price_initial,
        price_estimate = EXCLUDED.price_estimate,
        minimum_bid_eur = EXCLUDED.minimum_bid_eur,
        valor_tasacion_eur = EXCLUDED.valor_tasacion_eur,
        importe_deposito_eur = EXCLUDED.importe_deposito_eur,
        auction_status = EXCLUDED.auction_status,
        auction_end = EXCLUDED.auction_end,
        investment_score = EXCLUDED.investment_score,
        investment_score_description = EXCLUDED.investment_score_description,
        charges_detected = EXCLUDED.charges_detected,
        charges_description = EXCLUDED.charges_description,
        legal_charges_description = EXCLUDED.legal_charges_description,
        url = EXCLUDED.url,
        updated_at = NOW()
      RETURNING id`,
      [
        a.subasta_id,
        title,
        description,
        mapPropertyType(a.uso_catastro),
        provinceName(a.provincia_boe),
        text(a.municipio_boe),
        num(a.puja_minima_eur),
        num(a.valor_tasacion_eur),
        num(a.importe_deposito_eur),
        text(a.estado_subasta)?.toLowerCase() ?? null,
        text(a.fecha_cierre),
        text(a.score_inversion),
        text(a.score_descripcion),
        yes(a.cargas_detectadas),
        text(a.descripcion_cargas),
        text(a.url_boe)
      ]
    );
    const auctionId = auctionResult.rows[0].id;

    await client.query(
      `INSERT INTO auction_details (
        auction_id, cadastre_ref, cadastre_available, cadastre_use,
        property_constructed_sqm, property_land_sqm, property_year_catastro,
        cadastre_address, gps_latitude, gps_longitude, apify_run_id
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      ON CONFLICT (auction_id) DO UPDATE SET
        cadastre_ref = EXCLUDED.cadastre_ref,
        cadastre_available = EXCLUDED.cadastre_available,
        cadastre_use = EXCLUDED.cadastre_use,
        property_constructed_sqm = EXCLUDED.property_constructed_sqm,
        property_land_sqm = EXCLUDED.property_land_sqm,
        property_year_catastro = EXCLUDED.property_year_catastro,
        cadastre_address = EXCLUDED.cadastre_address,
        gps_latitude = EXCLUDED.gps_latitude,
        gps_longitude = EXCLUDED.gps_longitude,
        apify_run_id = EXCLUDED.apify_run_id,
        updated_at = NOW()`,
      [
        auctionId,
        text(a.referencia_catastral),
        yes(a.catastro_disponible),
        text(a.uso_catastro),
        num(a.superficie_construida_m2),
        num(a.superficie_suelo_m2),
        int(a.antiguedad_ano),
        text(a.direccion_catastro),
        lat,
        lng,
        apifyRunId
      ]
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
