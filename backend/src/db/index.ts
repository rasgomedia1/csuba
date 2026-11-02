// Kept for backwards compatibility: everything shares the single pool in connection.ts.
import pool, { query, initializeDatabase, getPool } from './connection.js';

export { query, initializeDatabase, getPool };

export const db = { pool, query, initializeDatabase, getPool };

export default pool;
