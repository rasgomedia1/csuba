import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function check() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT 
        id,
        title,
        auction_end,
        created_at,
        updated_at
      FROM auctions 
      LIMIT 10
    `);
    
    console.log('Sample auction dates:\n');
    result.rows.forEach((row, idx) => {
      console.log(`${idx + 1}. ${row.title.substring(0, 50)}`);
      console.log(`   auction_end: ${row.auction_end}`);
      console.log(`   created_at: ${row.created_at}`);
      console.log('');
    });

    // Check unique dates
    const unique = await client.query(`
      SELECT DISTINCT auction_end 
      FROM auctions 
      WHERE auction_end IS NOT NULL
      ORDER BY auction_end DESC
    `);
    
    console.log('\nUnique auction_end dates:');
    unique.rows.forEach(row => {
      console.log(`  ${row.auction_end}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

check();
