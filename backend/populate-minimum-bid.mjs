import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function populate() {
  const client = await pool.connect();
  try {
    console.log('⏳ Llenando minimum_bid_eur con price_initial...');
    
    const result = await client.query(`
      UPDATE auctions 
      SET minimum_bid_eur = price_initial
      WHERE minimum_bid_eur IS NULL
      RETURNING id
    `);
    
    console.log(`✅ ${result.rowCount} registros actualizados`);
    
    // Verify
    const verify = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(minimum_bid_eur) as con_valor
      FROM auctions
    `);
    
    console.log(`\n✅ Verificación:`);
    console.log(`   Total: ${verify.rows[0].total}`);
    console.log(`   Con valor: ${verify.rows[0].con_valor}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

populate();
