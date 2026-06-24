import { Pool } from 'pg';
import fs from 'fs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('Ejecutando migración 002_add_minimum_bid.sql...');
    const migration = fs.readFileSync('./src/db/migrations/002_add_minimum_bid.sql', 'utf-8');
    await client.query(migration);
    console.log('✅ Migración completada');
  } catch (error) {
    console.error('❌ Error en migración:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
