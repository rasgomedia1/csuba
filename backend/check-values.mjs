import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function check() {
  const client = await pool.connect();
  try {
    console.log('Verificando valores en minimum_bid_eur...\n');
    
    // Get statistics
    const stats = await client.query(`
      SELECT 
        COUNT(*) as total_registros,
        COUNT(minimum_bid_eur) as con_valor,
        COUNT(*) - COUNT(minimum_bid_eur) as null_count,
        MIN(minimum_bid_eur) as minimo,
        MAX(minimum_bid_eur) as maximo,
        AVG(minimum_bid_eur) as promedio
      FROM auctions
    `);
    
    console.log('ESTADÍSTICAS:');
    const row = stats.rows[0];
    console.log(`  Total registros: ${row.total_registros}`);
    console.log(`  Con valor: ${row.con_valor}`);
    console.log(`  NULLs: ${row.null_count}`);
    console.log(`  Mínimo: ${row.minimo}`);
    console.log(`  Máximo: ${row.maximo}`);
    console.log(`  Promedio: ${row.promedio ? Math.round(row.promedio) : 'N/A'}`);
    
    // Sample data
    console.log('\nMUESTRA DE DATOS:');
    const sample = await client.query(`
      SELECT 
        id, 
        title, 
        minimum_bid_eur, 
        price_initial,
        price_estimate
      FROM auctions 
      LIMIT 10
    `);
    
    sample.rows.forEach((r, idx) => {
      console.log(`${idx + 1}. minimum_bid_eur: ${r.minimum_bid_eur || 'NULL'} | price_initial: ${r.price_initial} | title: ${r.title.substring(0, 50)}...`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

check();
