import { query } from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';

export interface SearchFilters {
  province?: string;
  propertyType?: string;
  priceMin?: number;
  priceMax?: number;
  auctionStatus?: string;
  occupancyStatus?: string;
  maxRiskScore?: number;
  investmentScore?: string;
  search?: string; // Text search
  sortBy?: 'price' | 'riskScore' | 'date' | 'investmentScore';
  limit?: number;
  offset?: number;
}

export async function searchAuctions(filters: SearchFilters) {
  let sql = `SELECT a.*,
    ad.cadastre_ref, ad.cadastre_available, ad.cadastre_use,
    ad.property_constructed_sqm, ad.property_land_sqm,
    ad.property_year_catastro,
    ad.cadastre_address, ad.gps_latitude, ad.gps_longitude
  FROM auctions a
  LEFT JOIN auction_details ad ON a.id = ad.auction_id
  WHERE 1=1`;
  const params: any[] = [];
  let paramIndex = 1;

  if (filters.province) {
    sql += ` AND province = $${paramIndex}`;
    params.push(filters.province);
    paramIndex++;
  }

  if (filters.propertyType) {
    sql += ` AND property_type = $${paramIndex}`;
    params.push(filters.propertyType);
    paramIndex++;
  }

  if (filters.priceMin !== undefined) {
    sql += ` AND price_initial >= $${paramIndex}`;
    params.push(filters.priceMin);
    paramIndex++;
  }

  if (filters.priceMax !== undefined) {
    sql += ` AND price_initial <= $${paramIndex}`;
    params.push(filters.priceMax);
    paramIndex++;
  }

  if (filters.auctionStatus) {
    sql += ` AND auction_status = $${paramIndex}`;
    params.push(filters.auctionStatus);
    paramIndex++;
  }

  if (filters.occupancyStatus) {
    sql += ` AND occupancy_status = $${paramIndex}`;
    params.push(filters.occupancyStatus);
    paramIndex++;
  }

  if (filters.maxRiskScore !== undefined) {
    sql += ` AND risk_score_overall <= $${paramIndex}`;
    params.push(filters.maxRiskScore);
    paramIndex++;
  }

  if (filters.investmentScore) {
    sql += ` AND investment_score = $${paramIndex}`;
    params.push(filters.investmentScore);
    paramIndex++;
  }

  if (filters.search) {
    sql += ` AND (a.title ILIKE $${paramIndex} OR a.description ILIKE $${paramIndex} OR ad.cadastre_address ILIKE $${paramIndex})`;
    params.push(`%${filters.search}%`);
    paramIndex++;
  }

  // Sorting
  const sortMap: Record<string, string> = {
    price: 'a.price_initial ASC',
    riskScore: 'a.risk_score_overall ASC',
    date: 'a.auction_end ASC',
    investmentScore: 'a.investment_score DESC'
  };

  sql += ` ORDER BY ${sortMap[filters.sortBy || 'date']}`;

  // Pagination
  sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(filters.limit || 20, filters.offset || 0);

  const result = await query(sql, params);
  return result.rows;
}

export async function getAuctionById(auctionId: string) {
  const auctionResult = await query(
    'SELECT * FROM auctions WHERE id = $1',
    [auctionId]
  );

  if (auctionResult.rows.length === 0) {
    throw new Error('Auction not found');
  }

  const auction = auctionResult.rows[0];

  const detailsResult = await query(
    'SELECT * FROM auction_details WHERE auction_id = $1',
    [auctionId]
  );

  const priceHistoryResult = await query(
    'SELECT * FROM price_history WHERE auction_id = $1 ORDER BY recorded_at ASC',
    [auctionId]
  );

  return {
    ...auction,
    details: detailsResult.rows[0],
    priceHistory: priceHistoryResult.rows
  };
}

export async function calculateRiskScore(auctionId: string): Promise<{
  overall: number;
  legal: number;
  occupancy: number;
  market: number;
  factors: string[];
}> {
  const auctionResult = await query('SELECT * FROM auctions WHERE id = $1', [auctionId]);
  const detailsResult = await query('SELECT * FROM auction_details WHERE auction_id = $1', [auctionId]);

  if (auctionResult.rows.length === 0) {
    throw new Error('Auction not found');
  }

  const auction = auctionResult.rows[0];
  const details = detailsResult.rows[0];

  let legalRisk = 10;
  let occupancyRisk = 10;
  let marketRisk = 10;
  const factors: string[] = [];

  // Legal risk factors
  if (details?.liens_count && details.liens_count > 0) {
    legalRisk += Math.min(60, details.liens_count * 15);
    factors.push(`${details.liens_count} cargas legales detectadas`);
  }

  if (details?.legal_charges && details.legal_charges.length > 0) {
    legalRisk += 20;
    factors.push('Cargos legales en la propiedad');
  }

  // Occupancy risk
  if (auction.occupancy_status === 'occupied') {
    occupancyRisk = 70;
    factors.push('Propiedad ocupada (requiere desalojo)');
  } else if (auction.occupancy_status === 'unknown') {
    occupancyRisk = 40;
    factors.push('Estado de ocupación desconocido');
  }

  // Market risk
  if (auction.price_estimate && auction.price_initial) {
    const discountPercent = ((auction.price_estimate - auction.price_initial) / auction.price_estimate) * 100;
    if (discountPercent > 40) {
      marketRisk = 60;
      factors.push(`Descuento alto (${Math.round(discountPercent)}%)`);
    } else if (discountPercent > 20) {
      marketRisk = 40;
      factors.push(`Descuento moderado (${Math.round(discountPercent)}%)`);
    }
  }

  const overallRisk = Math.round((legalRisk + occupancyRisk + marketRisk) / 3);

  // Update auction with risk scores
  await query(
    `UPDATE auctions
     SET risk_score_overall = $2,
         risk_score_legal = $3,
         risk_score_occupancy = $4,
         risk_score_market = $5,
         risk_factors = $6,
         updated_at = NOW()
     WHERE id = $1`,
    [auctionId, overallRisk, legalRisk, occupancyRisk, marketRisk, factors]
  );

  return {
    overall: overallRisk,
    legal: legalRisk,
    occupancy: occupancyRisk,
    market: marketRisk,
    factors
  };
}

export async function getUserWatchlist(userId: string, limit: number = 50, offset: number = 0) {
  const result = await query(
    `SELECT a.*, ut.status, ut.personal_notes, ut.created_at as added_to_watchlist
     FROM auctions a
     INNER JOIN user_tracking ut ON a.id = ut.auction_id
     WHERE ut.user_id = $1 AND ut.status = 'watchlist'
     ORDER BY ut.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return result.rows;
}

export async function addToWatchlist(userId: string, auctionId: string, notes?: string) {
  const result = await query(
    `INSERT INTO user_tracking (id, user_id, auction_id, status, personal_notes)
     VALUES ($1, $2, $3, 'watchlist', $4)
     ON CONFLICT (user_id, auction_id) DO UPDATE
     SET status = 'watchlist', personal_notes = COALESCE($4, personal_notes), updated_at = NOW()
     RETURNING *`,
    [uuidv4(), userId, auctionId, notes || null]
  );

  return result.rows[0];
}

export async function removeFromWatchlist(userId: string, auctionId: string) {
  await query(
    'DELETE FROM user_tracking WHERE user_id = $1 AND auction_id = $2',
    [userId, auctionId]
  );

  return { success: true };
}
