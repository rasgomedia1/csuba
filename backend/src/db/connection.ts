import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load env here so the pool gets DATABASE_URL regardless of module import order.
// On Vercel env vars come from the platform and dotenv.config() is a no-op.
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

// Single pool for the whole app. On serverless (Vercel) keep it tiny and rely
// on Neon's pooled endpoint (-pooler host); a larger pool per instance would
// exhaust Postgres.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: process.env.VERCEL ? 1 : 10,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

const LOG_QUERIES = process.env.LOG_QUERIES === 'true';

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    if (LOG_QUERIES) {
      console.log(`✓ Query (${Date.now() - start}ms): ${text.substring(0, 60)}...`);
    }
    return result;
  } catch (error) {
    console.error('Query error:', (error as Error).message);
    throw error;
  }
}

export async function initializeDatabase() {
  return pool.query('SELECT NOW()');
}

export function getPool() {
  return pool;
}

export default pool;
