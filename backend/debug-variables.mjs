import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function debug() {
  const client = await pool.connect();
  try {
    console.log('DEBUG: Comparación de variables\n');
    
    // Get sample data
    const result = await client.query(`
      SELECT 
        title,
        minimum_bid_eur,
        price_initial,
        price_estimate
      FROM auctions 
      ORDER BY minimum_bid_eur DESC
      LIMIT 5
    `);
    
    console.log('TOP 5 subastas por minimum_bid_eur (DESC):\n');
    result.rows.forEach((row, idx) => {
      console.log(`${idx + 1}. ${row.title.substring(0, 40)}`);
      console.log(`   minimum_bid_eur: ${row.minimum_bid_eur}`);
      console.log(`   price_initial:   ${row.price_initial}`);
      console.log(`   price_estimate:  ${row.price_estimate}`);
      console.log('');
    });

    // Test filter
    console.log('\n' + '='.repeat(60));
    console.log('TEST FILTRO: WHERE minimum_bid_eur <= 100000\n');
    
    const filtered = await client.query(`
      SELECT title, minimum_bid_eur, price_initial
      FROM auctions 
      WHERE minimum_bid_eur <= 100000
      ORDER BY minimum_bid_eur DESC
    `);
    
    console.log(`Resultados: ${filtered.rows.length} registros\n`);
    filtered.rows.forEach((row) => {
      console.log(`• ${row.title.substring(0, 45)} | minimum_bid: ${row.minimum_bid_eur}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

debug();
