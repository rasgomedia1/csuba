-- Migration: Add Catastro and investment score fields

-- Add fields to auctions table
ALTER TABLE auctions ADD COLUMN IF NOT EXISTS
  investment_score VARCHAR(20); -- 'BAJO', 'MEDIO', 'ALTO', 'MUY_ALTO'

ALTER TABLE auctions ADD COLUMN IF NOT EXISTS
  investment_score_description TEXT;

ALTER TABLE auctions ADD COLUMN IF NOT EXISTS
  charges_detected BOOLEAN DEFAULT FALSE;

ALTER TABLE auctions ADD COLUMN IF NOT EXISTS
  charges_description TEXT;

-- Add Catastro fields to auction_details
ALTER TABLE auction_details ADD COLUMN IF NOT EXISTS
  cadastre_available BOOLEAN DEFAULT FALSE;

ALTER TABLE auction_details ADD COLUMN IF NOT EXISTS
  cadastre_use VARCHAR(100); -- 'Residencial', 'Comercial', etc.

ALTER TABLE auction_details ADD COLUMN IF NOT EXISTS
  property_constructed_sqm DECIMAL(10,2); -- from Catastro

ALTER TABLE auction_details ADD COLUMN IF NOT EXISTS
  property_land_sqm DECIMAL(10,2); -- from Catastro

ALTER TABLE auction_details ADD COLUMN IF NOT EXISTS
  property_year_catastro INT; -- from Catastro

ALTER TABLE auction_details ADD COLUMN IF NOT EXISTS
  cadastre_address VARCHAR(300);

ALTER TABLE auction_details ADD COLUMN IF NOT EXISTS
  gps_latitude DECIMAL(10,8);

ALTER TABLE auction_details ADD COLUMN IF NOT EXISTS
  gps_longitude DECIMAL(11,8);

ALTER TABLE auction_details ADD COLUMN IF NOT EXISTS
  apify_run_id VARCHAR(100); -- Track which Apify run this came from

-- Create index for investment score
CREATE INDEX IF NOT EXISTS idx_auctions_investment_score ON auctions(investment_score);

-- Create index for GPS coordinates
CREATE INDEX IF NOT EXISTS idx_auction_details_gps ON auction_details(gps_latitude, gps_longitude);
