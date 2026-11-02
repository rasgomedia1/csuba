// Creates or updates the admin account (npm run create-admin).
// Username/email/password come from env (ADMIN_USERNAME, ADMIN_EMAIL,
// ADMIN_PASSWORD in backend/.env); the password is never hardcoded here.
import bcrypt from 'bcryptjs';
import { query, getPool } from './connection.js';

async function main() {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const email = process.env.ADMIN_EMAIL || 'admin@csuba.es';
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.length < 8) {
    throw new Error('ADMIN_PASSWORD must be set in backend/.env (8+ characters)');
  }
  const hash = await bcrypt.hash(password, 10);
  const result = await query(
    `INSERT INTO users (email, username, password_hash, user_plan, is_admin)
     VALUES ($1, $2, $3, 'donor', true)
     ON CONFLICT (email) DO UPDATE
       SET username = EXCLUDED.username, password_hash = EXCLUDED.password_hash, is_admin = true
     RETURNING id, email, username, is_admin`,
    [email, username, hash]
  );
  console.log('✅ Admin ready:', result.rows[0].username, `<${result.rows[0].email}>`);
}

main()
  .catch((err) => {
    console.error('❌', err.message);
    process.exitCode = 1;
  })
  .finally(() => getPool().end());
