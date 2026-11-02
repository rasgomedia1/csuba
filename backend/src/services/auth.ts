import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';

export async function registerUser(
  email: string,
  username: string,
  password: string,
  investmentMin?: number,
  investmentMax?: number,
  userPlan?: 'free' | 'donor'
) {
  const existingUser = await query('SELECT id FROM users WHERE email = $1 OR username = $2', [email, username]);

  if (existingUser.rows.length > 0) {
    throw new Error('User already exists');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const userId = uuidv4();

  const result = await query(
    `INSERT INTO users (id, email, username, password_hash, investment_min, investment_max, user_plan)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, email, username, user_plan`,
    [userId, email, username, passwordHash, investmentMin || null, investmentMax || null, userPlan || 'free']
  );

  return result.rows[0];
}

export async function loginUser(email: string, password: string) {
  const result = await query('SELECT id, email, username, password_hash FROM users WHERE email = $1', [email]);

  if (result.rows.length === 0) {
    throw new Error('Invalid credentials');
  }

  const user = result.rows[0];
  const validPassword = await bcrypt.compare(password, user.password_hash);

  if (!validPassword) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '7d' }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username
    }
  };
}

export async function getUserById(userId: string) {
  const result = await query(
    'SELECT id, email, username, investment_min, investment_max, province_preferences FROM users WHERE id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    throw new Error('User not found');
  }

  return result.rows[0];
}

export async function updateUserPreferences(
  userId: string,
  investmentMin?: number,
  investmentMax?: number,
  provincePreferences?: string[],
  propertyTypePreferences?: string[]
) {
  const result = await query(
    `UPDATE users
     SET investment_min = COALESCE($2, investment_min),
         investment_max = COALESCE($3, investment_max),
         province_preferences = COALESCE($4, province_preferences),
         property_type_preferences = COALESCE($5, property_type_preferences),
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [userId, investmentMin, investmentMax, provincePreferences, propertyTypePreferences]
  );

  return result.rows[0];
}
