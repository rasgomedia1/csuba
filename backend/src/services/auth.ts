import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../db/connection.js';
import { getJwtSecret } from '../config.js';
import { HttpError } from '../validation.js';

export type UserPlan = 'free' | 'donor';

// Columns safe to send to the client (never password_hash).
const PUBLIC_USER_COLUMNS =
  'id, email, username, user_plan, investment_min, investment_max, province_preferences, property_type_preferences';

// Valid bcrypt hash of a random string, used to keep login timing constant
// when the user does not exist.
const DUMMY_HASH = bcrypt.hashSync('csuba-timing-equalizer', 10);

export async function registerUser(
  email: string,
  username: string,
  password: string,
  investmentMin?: number,
  investmentMax?: number,
  userPlan: UserPlan = 'free'
) {
  const existing = await query(
    'SELECT 1 FROM users WHERE lower(email) = lower($1) OR lower(username) = lower($2)',
    [email, username]
  );
  if (existing.rows.length > 0) {
    throw new HttpError(409, 'Email or username not available');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const result = await query(
      `INSERT INTO users (email, username, password_hash, investment_min, investment_max, user_plan)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, username, user_plan`,
      [email, username, passwordHash, investmentMin ?? null, investmentMax ?? null, userPlan]
    );
    return result.rows[0];
  } catch (err: any) {
    // Race with a concurrent registration of the same email/username.
    if (err.code === '23505') throw new HttpError(409, 'Email or username not available');
    throw err;
  }
}

// `identifier` may be an email or a username. An exact email match always
// wins; usernames are unique, so there is never more than one candidate.
export async function loginUser(identifier: string, password: string) {
  const result = await query(
    `SELECT id, email, username, user_plan, password_hash FROM users
     WHERE lower(email) = lower($1) OR lower(username) = lower($1)
     ORDER BY (lower(email) = lower($1)) DESC
     LIMIT 1`,
    [identifier]
  );

  const user = result.rows[0];
  // Always run bcrypt so response time does not reveal whether the user exists.
  const validPassword = await bcrypt.compare(password, user?.password_hash ?? DUMMY_HASH);

  if (!user || !validPassword) {
    throw new HttpError(401, 'Invalid credentials');
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, getJwtSecret(), { expiresIn: '7d' });

  return {
    token,
    user: { id: user.id, email: user.email, username: user.username, user_plan: user.user_plan }
  };
}

export async function getUserById(userId: string) {
  const result = await query(`SELECT ${PUBLIC_USER_COLUMNS} FROM users WHERE id = $1`, [userId]);
  if (result.rows.length === 0) {
    throw new HttpError(404, 'User not found');
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
     RETURNING ${PUBLIC_USER_COLUMNS}`,
    [userId, investmentMin ?? null, investmentMax ?? null, provincePreferences ?? null, propertyTypePreferences ?? null]
  );
  if (result.rows.length === 0) {
    throw new HttpError(404, 'User not found');
  }
  return result.rows[0];
}
