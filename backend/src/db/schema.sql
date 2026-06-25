-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  investment_min DECIMAL(10,2),
  investment_max DECIMAL(10,2),
  province_preferences VARCHAR(100)[],
  property_type_preferences VARCHAR(50)[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Auctions table
CREATE TABLE IF NOT EXISTS auctions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source VARCHAR(50) NOT NULL, -- 'boe', 'hacienda', 'ss'
  external_id VARCHAR(200) UNIQUE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  property_type VARCHAR(50), -- 'property', 'vehicle', 'goods', 'other'
  province VARCHAR(100),
  municipality VARCHAR(100),
  price_initial DECIMAL(15,2),
  price_estimate DECIMAL(15,2),
  price_final DECIMAL(15,2),
  minimum_bid_eur DECIMAL(15,2),
  valor_tasacion_eur DECIMAL(15,2),
  investment_score VARCHAR(20),
  legal_charges_description TEXT,
  auction_status VARCHAR(50), -- 'active', 'completed', 'deserted', 'cancelled'
  auction_start DATE,
  auction_end DATE,
  occupancy_status VARCHAR(50), -- 'occupied', 'empty', 'unknown'
  risk_score_overall INT, -- 0-100
  risk_score_legal INT,
  risk_score_occupancy INT,
  risk_score_market INT,
  risk_factors TEXT[],
  url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Auction details (legal info, liens, etc)
CREATE TABLE IF NOT EXISTS auction_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  cadastre_ref VARCHAR(50),
  property_area_sqm DECIMAL(10,2),
  property_year_built INT,
  liens_count INT DEFAULT 0,
  creditors TEXT[],
  legal_charges TEXT[],
  inspection_period_start DATE,
  inspection_period_end DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User tracking (watchlist, bids)
CREATE TABLE IF NOT EXISTS user_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  status VARCHAR(50), -- 'watchlist', 'bidding', 'won', 'lost', 'abandoned'
  personal_notes TEXT,
  visited_at TIMESTAMP,
  contacted_for_inspection BOOLEAN DEFAULT FALSE,
  bid_amount DECIMAL(15,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, auction_id)
);

-- Price history (track price changes)
CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  price DECIMAL(15,2) NOT NULL,
  price_type VARCHAR(50), -- 'initial', 'rebaja', 'final'
  recorded_at TIMESTAMP DEFAULT NOW()
);

-- Alerts (user notifications)
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  auction_id UUID REFERENCES auctions(id) ON DELETE CASCADE,
  alert_type VARCHAR(50), -- 'price_drop', 'new_auction', 'ending_soon', 'status_change'
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Search filters (save filters for users)
CREATE TABLE IF NOT EXISTS saved_filters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filter_name VARCHAR(100),
  price_min DECIMAL(15,2),
  price_max DECIMAL(15,2),
  provinces VARCHAR(100)[],
  property_types VARCHAR(50)[],
  occupancy_status VARCHAR(50)[],
  max_risk_score INT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indices for performance
CREATE INDEX idx_auctions_source ON auctions(source);
CREATE INDEX idx_auctions_status ON auctions(auction_status);
CREATE INDEX idx_auctions_province ON auctions(province);
CREATE INDEX idx_auctions_price ON auctions(price_initial);
CREATE INDEX idx_auctions_dates ON auctions(auction_start, auction_end);
CREATE INDEX idx_auctions_risk ON auctions(risk_score_overall);
CREATE INDEX idx_user_tracking_user ON user_tracking(user_id);
CREATE INDEX idx_user_tracking_auction ON user_tracking(auction_id);
CREATE INDEX idx_alerts_user ON alerts(user_id);
CREATE INDEX idx_price_history_auction ON price_history(auction_id);
