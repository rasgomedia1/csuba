import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load env here so the pool gets DATABASE_URL regardless of module import order
// (this module can be loaded before the app entry runs dotenv). On Vercel env
// vars come from the platform and dotenv.config() is a harmless no-op.
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Keep the pool tiny on serverless (Vercel) and rely on Neon's pooled
  // endpoint; a larger pool per instance would exhaust Postgres.
  max: process.env.VERCEL ? 1 : 10,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`✓ Executed query (${duration}ms): ${text.substring(0, 50)}...`);
    return result;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

export async function initializeDatabase() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connection test successful');
    return result;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

export function getPool() {
  return pool;
}

export default pool;
