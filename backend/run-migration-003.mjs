import dotenv from 'dotenv';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('Running migration 003_add_apify_fields.sql...');
    
    const migration = fs.readFileSync(
      path.join(process.cwd(), 'src/db/migrations/003_add_apify_fields.sql'),
      'utf8'
    );

    const statements = migration.split(';').filter(s => s.trim() && !s.trim().startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`\nExecuting:\n${statement.trim()}\n`);
        await client.query(statement);
      }
    }

    console.log('✅ Migration 003 completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
