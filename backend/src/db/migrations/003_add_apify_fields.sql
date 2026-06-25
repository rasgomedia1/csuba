-- Migration: Add Apify fields to auctions table
-- Created: 2026-06-26
-- Purpose: Add missing columns from Apify bot data

ALTER TABLE auctions
ADD COLUMN IF NOT EXISTS minimum_bid_eur DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS valor_tasacion_eur DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS investment_score VARCHAR(20),
ADD COLUMN IF NOT EXISTS legal_charges_description TEXT;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_auctions_valor_tasacion ON auctions(valor_tasacion_eur);
CREATE INDEX IF NOT EXISTS idx_auctions_investment_score ON auctions(investment_score);

-- Log
-- ALTER TABLE completed successfully
