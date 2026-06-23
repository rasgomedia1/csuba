import { Pool } from 'pg';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigrations() {
  try {
    console.log('🔄 Running migrations...');

    // First, run the main schema (only if tables don't exist)
    console.log('\n📝 Checking schema...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = await fs.readFile(schemaPath, 'utf-8');
    try {
      await pool.query(schemaSql);
      console.log('✅ schema.sql completed');
    } catch (err: any) {
      if (err.message.includes('already exists')) {
        console.log('⏭️  Tables already exist, skipping schema.sql');
      } else {
        throw err;
      }
    }

    // Then run migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = await fs.readdir(migrationsDir);
    const sqlFiles = files.filter(f => f.endsWith('.sql')).sort();

    for (const file of sqlFiles) {
      const filePath = path.join(migrationsDir, file);
      const sql = await fs.readFile(filePath, 'utf-8');

      console.log(`\n📝 Running migration: ${file}`);
      await pool.query(sql);
      console.log(`✅ ${file} completed`);
    }

    console.log('\n✨ All migrations completed successfully!');
    pool.end();
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

runMigrations();
