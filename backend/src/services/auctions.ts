import { query } from '../db/connection.js';
import { HttpError } from '../validation.js';
import { PROVINCE_CODES } from '../scrapers/boe.js';

// The BOE stores bilingual names ("Castellón/Castelló", "Alicante/Alacant"),
// Basque/Catalan forms ("Bizkaia") and occasionally the INE code ("12"). A
// province filter matches any slash-separated part, any alias, or the code.
const PROVINCE_ALIASES: string[][] = [
  ['Vizcaya', 'Bizkaia', 'Biscay'],
  ['Guipúzcoa', 'Gipuzkoa'],
  ['Álava', 'Araba', 'Alava'],
  ['Baleares', 'Illes Balears', 'Islas Baleares', 'Balears'],
  ['A Coruña', 'La Coruña', 'Coruña'],
  ['Girona', 'Gerona'],
  ['Lleida', 'Lérida'],
  ['Ourense', 'Orense'],
  ['Castellón', 'Castelló', 'Castellon'],
  ['Alicante', 'Alacant'],
  ['Valencia', 'València'],
  ['Asturias', 'Principado de Asturias'],
  ['Navarra', 'Nafarroa'],
  ['Las Palmas', 'Palmas (Las)'],
  ['Santa Cruz de Tenerife', 'Tenerife']
];

export function provinceVariants(province: string): string[] {
  const norm = (s: string) => s.trim().toLowerCase();
  const variants = new Set([norm(province)]);
  for (const group of PROVINCE_ALIASES) {
    if (group.some((g) => norm(g) === norm(province))) group.forEach((g) => variants.add(norm(g)));
  }
  const code = Object.entries(PROVINCE_CODES).find(([name]) => variants.has(norm(name)))?.[1];
  if (code) variants.add(code);
  return [...variants];
}

export interface SearchFilters {
  province?: string;
  propertyType?: string;
  priceMin?: number;
  priceMax?: number;
  areaMin?: number;
  auctionStatus?: string;
  occupancyStatus?: string;
  investmentScore?: string;
  maxRiskScore?: number;
  minimumBidMax?: number;
  minimumBidMin?: number;
  search?: string;
  sortBy?: string;
  limit: number;
  offset: number;
}

// Investment score scale, worst → best. The filter means "at least this score",
// matching the Apify actor's `scoreMinimo` semantics.
export const SCORE_LEVELS = ['BAJO', 'MEDIO', 'ALTO', 'MUY_ALTO'] as const;

const SCORE_RANK_SQL = `CASE a.investment_score
  WHEN 'MUY_ALTO' THEN 4 WHEN 'ALTO' THEN 3 WHEN 'MEDIO' THEN 2 WHEN 'BAJO' THEN 1 ELSE 0 END`;

const SORT_MAP: Record<string, string> = {
  price: 'a.price_initial ASC NULLS LAST',
  date: 'a.auction_end ASC NULLS LAST',
  auctionEnd: 'a.auction_end ASC NULLS LAST',
  minimumBid: 'a.minimum_bid_eur ASC NULLS LAST',
  depositAmount: 'a.importe_deposito_eur ASC NULLS LAST',
  tasacion: 'a.valor_tasacion_eur DESC NULLS LAST',
  investmentScore: `${SCORE_RANK_SQL} DESC`,
  pricePerM2:
    'CASE WHEN ad.property_constructed_sqm > 0 THEN (COALESCE(a.valor_tasacion_eur, a.price_initial) / ad.property_constructed_sqm) END ASC NULLS LAST'
};

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
  const add = (clause: string, value: any) => {
    params.push(value);
    sql += ` AND ${clause.replace('?', `$${params.length}`)}`;
  };

  if (filters.province) {
    add(
      "EXISTS (SELECT 1 FROM unnest(string_to_array(a.province, '/')) AS part WHERE lower(trim(part)) = ANY(?))",
      provinceVariants(filters.province)
    );
  }
  if (filters.propertyType) add('a.property_type = ?', filters.propertyType);
  if (filters.priceMin !== undefined) add('a.price_initial >= ?', filters.priceMin);
  if (filters.priceMax !== undefined) add('a.price_initial <= ?', filters.priceMax);
  if (filters.minimumBidMax !== undefined) add('a.minimum_bid_eur <= ?', filters.minimumBidMax);
  if (filters.minimumBidMin !== undefined) add('a.minimum_bid_eur >= ?', filters.minimumBidMin);
  if (filters.areaMin !== undefined) add('ad.property_constructed_sqm >= ?', filters.areaMin);
  if (filters.auctionStatus) add('a.auction_status = ?', filters.auctionStatus);
  if (filters.occupancyStatus) add('a.occupancy_status = ?', filters.occupancyStatus);
  if (filters.maxRiskScore !== undefined) add('a.risk_score_overall <= ?', filters.maxRiskScore);

  if (filters.investmentScore) {
    const idx = SCORE_LEVELS.indexOf(filters.investmentScore as any);
    if (idx >= 0) add('a.investment_score = ANY(?)', SCORE_LEVELS.slice(idx));
  }

  if (filters.search) {
    params.push(`%${filters.search}%`);
    const p = `$${params.length}`;
    sql += ` AND (a.title ILIKE ${p} OR a.description ILIKE ${p} OR ad.cadastre_address ILIKE ${p})`;
  }

  sql += ` ORDER BY ${SORT_MAP[filters.sortBy || 'date'] || SORT_MAP.date}, a.id`;

  params.push(filters.limit, filters.offset);
  sql += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;

  const result = await query(sql, params);
  return result.rows;
}

async function assertAuctionExists(auctionId: string) {
  const r = await query('SELECT 1 FROM auctions WHERE id = $1', [auctionId]);
  if (r.rows.length === 0) throw new HttpError(404, 'Auction not found');
}

export async function getAuctionById(auctionId: string) {
  const auctionResult = await query('SELECT * FROM auctions WHERE id = $1', [auctionId]);
  if (auctionResult.rows.length === 0) {
    throw new HttpError(404, 'Auction not found');
  }

  const [detailsResult, priceHistoryResult] = await Promise.all([
    query('SELECT * FROM auction_details WHERE auction_id = $1', [auctionId]),
    query('SELECT * FROM price_history WHERE auction_id = $1 ORDER BY recorded_at ASC', [auctionId])
  ]);

  return {
    ...auctionResult.rows[0],
    details: detailsResult.rows[0],
    priceHistory: priceHistoryResult.rows
  };
}

export async function getUserWatchlist(userId: string, limit: number, offset: number) {
  const result = await query(
    `SELECT a.*,
            ad.property_constructed_sqm, ad.property_land_sqm, ad.property_year_catastro,
            ad.cadastre_address, ad.gps_latitude, ad.gps_longitude,
            ut.status, ut.personal_notes, ut.created_at as added_to_watchlist
     FROM auctions a
     INNER JOIN user_tracking ut ON a.id = ut.auction_id
     LEFT JOIN auction_details ad ON a.id = ad.auction_id
     WHERE ut.user_id = $1 AND ut.status = 'watchlist'
     ORDER BY ut.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return result.rows;
}

export async function isInWatchlist(userId: string, auctionId: string) {
  const r = await query(
    `SELECT 1 FROM user_tracking WHERE user_id = $1 AND auction_id = $2 AND status = 'watchlist'`,
    [userId, auctionId]
  );
  return r.rows.length > 0;
}

export async function addToWatchlist(userId: string, auctionId: string, notes?: string) {
  await assertAuctionExists(auctionId);
  await query(
    `INSERT INTO user_tracking (user_id, auction_id, status, personal_notes)
     VALUES ($1, $2, 'watchlist', $3)
     ON CONFLICT (user_id, auction_id) DO UPDATE
     SET status = 'watchlist',
         personal_notes = COALESCE(EXCLUDED.personal_notes, user_tracking.personal_notes),
         updated_at = NOW()`,
    [userId, auctionId, notes ?? null]
  );

  return { success: true, auction_id: auctionId };
}

export async function removeFromWatchlist(userId: string, auctionId: string) {
  await query('DELETE FROM user_tracking WHERE user_id = $1 AND auction_id = $2', [userId, auctionId]);
  return { success: true };
}
