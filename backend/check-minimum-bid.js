import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkData() {
  try {
    // Check if column exists
    const columnCheck = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'auctions' AND column_name = 'minimum_bid_eur'
    `);
    
    if (columnCheck.rows.length === 0) {
      console.log('❌ Columna minimum_bid_eur NO EXISTE');
      return;
    }
    console.log('✅ Columna minimum_bid_eur existe');

    // Check data
    const dataCheck = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(minimum_bid_eur) as with_value,
        COUNT(*) - COUNT(minimum_bid_eur) as null_values,
        MIN(minimum_bid_eur) as min_val,
        MAX(minimum_bid_eur) as max_val
      FROM auctions
    `);
    
    console.log('\nDatos en columna:');
    console.log(dataCheck.rows[0]);

    // Check sample data
    const sample = await pool.query(`
      SELECT id, title, minimum_bid_eur, price_initial 
      FROM auctions 
      LIMIT 5
    `);
    
    console.log('\nMuestra de datos (primeros 5):');
    sample.rows.forEach(row => {
      console.log(`  ID: ${row.id.substring(0, 8)}... | minimum_bid: ${row.minimum_bid_eur} | price_initial: ${row.price_initial}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkData();
