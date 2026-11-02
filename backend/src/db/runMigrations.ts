import { Pool } from 'pg';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Applies schema.sql (idempotent) and then every migrations/*.sql not yet
// recorded in schema_migrations, each inside its own transaction.
async function runMigrations() {
  const client = await pool.connect();
  try {
    console.log('🔄 Running migrations...');

    await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      filename VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMP DEFAULT NOW()
    )`);

    const schemaSql = await fs.readFile(path.join(__dirname, 'schema.sql'), 'utf-8');
    await client.query(schemaSql);
    console.log('✅ schema.sql applied');

    const applied = new Set(
      (await client.query('SELECT filename FROM schema_migrations')).rows.map((r) => r.filename)
    );

    const migrationsDir = path.join(__dirname, 'migrations');
    const files = (await fs.readdir(migrationsDir)).filter((f) => f.endsWith('.sql')).sort();

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`⏭️  ${file} (already applied)`);
        continue;
      }
      const sql = await fs.readFile(path.join(migrationsDir, file), 'utf-8');
      console.log(`📝 Running migration: ${file}`);
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
      console.log(`✅ ${file} completed`);
    }

    console.log('\n✨ All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
