import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function cleanup() {
  try {
    console.log('🧹 Cleaning up auction data...');

    await pool.query('DELETE FROM price_history WHERE auction_id IN (SELECT id FROM auctions WHERE source = $1)', ['boe']);
    await pool.query('DELETE FROM user_tracking WHERE auction_id IN (SELECT id FROM auctions WHERE source = $1)', ['boe']);
    await pool.query('DELETE FROM auction_details WHERE auction_id IN (SELECT id FROM auctions WHERE source = $1)', ['boe']);
    await pool.query('DELETE FROM auctions WHERE source = $1', ['boe']);

    console.log('✅ Cleanup complete - ready for fresh sync');
    pool.end();
  } catch (error) {
    console.error('❌ Cleanup error:', error);
    process.exit(1);
  }
}

cleanup();
