/**
 * CSUBA Database Abstraction Layer
 * Automatically switches between real DB and mock DB
 */

import { Pool } from 'pg';
import * as mockDb from './mock.js';
import dotenv from 'dotenv';

dotenv.config();

const USE_MOCK_DB = process.env.USE_MOCK_DB === 'true' ||
                   !process.env.DATABASE_URL;

let pool: any;

if (USE_MOCK_DB) {
  console.log('⚠️  Using MOCK DATABASE (development mode)');
  console.log('   Set DATABASE_URL and USE_MOCK_DB=false for production');
  pool = mockDb.getMockPool();
} else {
  console.log('📊 Connecting to real PostgreSQL database...');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  pool.on('error', (err: Error) => {
    console.error('Unexpected error on idle client', err);
  });
}

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`✓ Query executed (${duration}ms)`);
    return result;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

export async function initializeDatabase() {
  try {
    if (USE_MOCK_DB) {
      await mockDb.mockInitializeDatabase();
    } else {
      const result = await pool.query('SELECT NOW()');
      console.log('✅ Database connection test successful');
      return result;
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

export function getPool() {
  return pool;
}

export const db = {
  pool,
  query,
  initializeDatabase,
  getPool
};

export default pool;
