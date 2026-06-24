-- Add minimum_bid_eur column to auctions table
ALTER TABLE auctions ADD COLUMN IF NOT EXISTS minimum_bid_eur DECIMAL(15,2);

-- Create index for filtering
CREATE INDEX IF NOT EXISTS idx_auctions_minimum_bid ON auctions(minimum_bid_eur);
