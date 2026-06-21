import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
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
