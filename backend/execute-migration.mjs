import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  console.log('Conectando a BD:', process.env.DATABASE_URL?.substring(0, 50) + '...');
  
  const client = await pool.connect();
  try {
    console.log('⏳ Ejecutando migración...');
    
    // Add column if not exists
    await client.query(`
      ALTER TABLE auctions ADD COLUMN IF NOT EXISTS minimum_bid_eur DECIMAL(15,2)
    `);
    console.log('✅ Columna minimum_bid_eur agregada');
    
    // Create index
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_auctions_minimum_bid ON auctions(minimum_bid_eur)
    `);
    console.log('✅ Índice creado');
    
    console.log('\n✅ Migración completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
