import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seed() {
  try {
    console.log('🌱 Seeding database with test data...');

    // Create test user
    const password = 'test123456';
    const passwordHash = await bcrypt.hash(password, 10);

    const userResult = await pool.query(
      `INSERT INTO users (email, username, password_hash, investment_min, investment_max)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO UPDATE SET password_hash = $3
       RETURNING id, email, username`,
      ['test@csuba.com', 'testuser', passwordHash, 5000, 100000]
    );

    const userId = userResult.rows[0].id;
    console.log('✅ Test user created:', userResult.rows[0]);
    console.log('   Email: test@csuba.com');
    console.log('   Password: test123456');
    console.log('   Investment range: €5,000 - €100,000');

    pool.end();
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();
