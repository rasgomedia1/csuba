import { query } from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';

export interface SearchFilters {
  province?: string;
  propertyType?: string;
  priceMax?: number;
  areaMin?: number;
  auctionStatus?: string;
  occupancyStatus?: string;
  investmentScore?: string;
  minimumBidMax?: number;
  search?: string;
  sortBy?: 'price' | 'date' | 'investmentScore' | 'pricePerM2';
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
    sql += ` AND a.price_initial <= $${paramIndex}`;
    params.push(filters.priceMax);
    paramIndex++;
  }

  if (filters.minimumBidMax !== undefined) {
    sql += ` AND a.minimum_bid_eur <= $${paramIndex}`;
    params.push(filters.minimumBidMax);
    paramIndex++;
  }

  if (filters.areaMin !== undefined) {
    sql += ` AND ad.property_constructed_sqm >= $${paramIndex}`;
    params.push(filters.areaMin);
    paramIndex++;
  }

  if (filters.auctionStatus) {
    sql += ` AND a.auction_status = $${paramIndex}`;
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
    date: 'a.auction_end ASC',
    investmentScore: 'a.investment_score DESC',
    pricePerM2: 'CASE WHEN ad.property_constructed_sqm > 0 THEN (a.price_initial / ad.property_constructed_sqm) ELSE a.price_initial END ASC'
  };

  sql += ` ORDER BY ${sortMap[filters.sortBy || 'date'] || sortMap['date']}`;

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

export async function getUserWatchlist(userId: string, limit: number = 50, offset: number = 0) {
  const result = await query(
    `SELECT a.id, a.external_id, a.title, a.description, a.property_type, a.province,
            a.municipality, a.price_initial, a.price_estimate, a.price_final,
            a.auction_status, a.auction_end, a.occupancy_status, a.risk_score_overall,
            a.url, ut.status, ut.personal_notes, ut.created_at as added_to_watchlist
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
  await query(
    `INSERT INTO user_tracking (id, user_id, auction_id, status, personal_notes)
     VALUES ($1, $2, $3, 'watchlist', $4)
     ON CONFLICT (user_id, auction_id) DO UPDATE
     SET status = 'watchlist', personal_notes = COALESCE($4, EXCLUDED.personal_notes), updated_at = NOW()`,
    [uuidv4(), userId, auctionId, notes || null]
  );

  return { success: true, auction_id: auctionId, user_id: userId };
}

export async function removeFromWatchlist(userId: string, auctionId: string) {
  await query(
    'DELETE FROM user_tracking WHERE user_id = $1 AND auction_id = $2',
    [userId, auctionId]
  );

  return { success: true };
}
