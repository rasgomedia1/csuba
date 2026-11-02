import dotenv from 'dotenv';

dotenv.config();

// JWT secret is mandatory: a hardcoded fallback would let anyone forge tokens
// if the env var were ever missing in a deploy.
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }
  return secret;
}

// Fail fast at import time so a misconfigured deploy never serves requests.
if ((getJwtSecret().length ?? 0) < 32) {
  console.warn('⚠️ JWT_SECRET is shorter than 32 characters; rotate it to a long random value.');
}
