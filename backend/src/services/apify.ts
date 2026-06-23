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

    // Check if auction exists
    const existingResult = await client.query(
      'SELECT id FROM auctions WHERE external_id = $1',
      [auction.subasta_id]
    );

    let auctionId: string;

    if (existingResult.rows.length > 0) {
      // Update existing
      auctionId = existingResult.rows[0].id;
      await client.query(
        `UPDATE auctions SET
          investment_score = $1,
          investment_score_description = $2,
          charges_detected = $3,
          charges_description = $4,
          updated_at = NOW()
        WHERE id = $5`,
        [
          auction.score_inversion,
          auction.score_descripcion,
          auction.cargas_detectadas === 'Sí',
          auction.descripcion_cargas,
          auctionId
        ]
      );
    } else {
      // Insert new
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
      auctionId = auctionResult.rows[0].id;
    }

    // Check if details exist
    const detailsResult = await client.query(
      'SELECT id FROM auction_details WHERE auction_id = $1',
      [auctionId]
    );

    if (detailsResult.rows.length > 0) {
      // Update existing
      await client.query(
        `UPDATE auction_details SET
          cadastre_available = $1,
          cadastre_use = $2,
          property_constructed_sqm = $3,
          property_land_sqm = $4,
          property_year_catastro = $5,
          gps_latitude = $6,
          gps_longitude = $7,
          apify_run_id = $8,
          updated_at = NOW()
        WHERE auction_id = $9`,
        [
          auction.catastro_disponible === 'Sí',
          auction.uso_catastro,
          surfaceConstructed,
          surfaceLand,
          yearBuilt,
          lat,
          lng,
          apifyRunId,
          auctionId
        ]
      );
    } else {
      // Insert new
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
        )`,
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
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`[APIFY] Error en transacción para ${auction.subasta_id}:`, error);
    throw error;
  } finally {
    client.release();
  }
}
