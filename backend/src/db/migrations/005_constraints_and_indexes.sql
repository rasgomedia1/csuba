-- One details row per auction (lets the Apify sync upsert by auction_id).
DELETE FROM auction_details ad
USING auction_details newer
WHERE ad.auction_id = newer.auction_id
  AND (ad.updated_at, ad.id) < (newer.updated_at, newer.id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_auction_details_auction_id ON auction_details(auction_id);

-- Sorting/filtering by closing date.
CREATE INDEX IF NOT EXISTS idx_auctions_auction_end ON auctions(auction_end);

-- Duplicate of the UNIQUE(external_id) constraint index.
DROP INDEX IF EXISTS idx_auctions_external_id;
