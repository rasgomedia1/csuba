import { Pool } from 'pg';

interface ApifyAuction {
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
}

export async function persistApifyAuctions(pool: Pool, auctions: ApifyAuction[], apifyRunId: string) {
  try {
    console.log(`[APIFY] Persistiendo ${auctions.length} subastas en PostgreSQL`);

    for (const auction of auctions) {
      await persistSingleAuction(pool, auction, apifyRunId);
    }

    console.log(`[APIFY] ✅ Todas las subastas persistidas`);
    return { success: true, count: auctions.length };
  } catch (error) {
    console.error(`[APIFY] ❌ Error persistiendo auctions:`, error);
    throw error;
  }
}

async function persistSingleAuction(pool: Pool, auction: ApifyAuction, apifyRunId: string) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Parse GPS coordinates
    const [lat, lng] = auction.coordenadas_gps && auction.coordenadas_gps !== 'No consta'
      ? auction.coordenadas_gps.split(',').map(c => parseFloat(c.trim()))
      : [null, null];

    // Parse numeric fields
    const surfaceConstructed = typeof auction.superficie_construida_m2 === 'number'
      ? auction.superficie_construida_m2
      : (auction.superficie_construida_m2 === 'No consta' ? null : parseFloat(auction.superficie_construida_m2 as string));

    const surfaceLand = typeof auction.superficie_suelo_m2 === 'number'
      ? auction.superficie_suelo_m2
      : (auction.superficie_suelo_m2 === 'No consta' ? null : parseFloat(auction.superficie_suelo_m2 as string));

    const yearBuilt = typeof auction.antiguedad_ano === 'number'
      ? auction.antiguedad_ano
      : (auction.antiguedad_ano === 'No consta' || !auction.antiguedad_ano ? null : parseInt(auction.antiguedad_ano as string));

    // Insert or update auction
    const auctionResult = await client.query(
      `INSERT INTO auctions (
        external_id, source, title, description,
        property_type, province, municipality,
        price_initial, price_estimate,
        auction_status, auction_end,
        occupancy_status, investment_score, investment_score_description,
        charges_detected, charges_description,
        url, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW(), NOW()
      )
      ON CONFLICT (external_id) DO UPDATE SET
        investment_score = $13,
        investment_score_description = $14,
        charges_detected = $15,
        charges_description = $16,
        updated_at = NOW()
      RETURNING id`,
      [
        auction.subasta_id,
        'boe', // source
        auction.descripcion_boe.substring(0, 500),
        auction.descripcion_boe,
        'property',
        auction.provincia_boe,
        auction.municipio_boe,
        auction.valor_tasacion_eur,
        auction.valor_tasacion_eur,
        auction.estado_subasta.toLowerCase(),
        auction.fecha_cierre,
        'unknown',
        auction.score_inversion,
        auction.score_descripcion,
        auction.cargas_detectadas === 'Sí',
        auction.descripcion_cargas,
        auction.url_boe
      ]
    );

    const auctionId = auctionResult.rows[0].id;

    // Insert or update auction_details
    await client.query(
      `INSERT INTO auction_details (
        auction_id, cadastre_ref,
        cadastre_available, cadastre_use,
        property_constructed_sqm, property_land_sqm,
        property_year_catastro,
        cadastre_address, gps_latitude, gps_longitude,
        apify_run_id,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()
      )
      ON CONFLICT (auction_id) DO UPDATE SET
        cadastre_available = $3,
        cadastre_use = $4,
        property_constructed_sqm = $5,
        property_land_sqm = $6,
        property_year_catastro = $7,
        gps_latitude = $9,
        gps_longitude = $10,
        apify_run_id = $11,
        updated_at = NOW()`,
      [
        auctionId,
        auction.referencia_catastral !== 'No consta' ? auction.referencia_catastral : null,
        auction.catastro_disponible === 'Sí',
        auction.uso_catastro,
        surfaceConstructed,
        surfaceLand,
        yearBuilt,
        auction.direccion_catastro !== 'No consta' ? auction.direccion_catastro : null,
        lat,
        lng,
        apifyRunId
      ]
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`[APIFY] Error en transacción para ${auction.subasta_id}:`, error);
    throw error;
  } finally {
    client.release();
  }
}
