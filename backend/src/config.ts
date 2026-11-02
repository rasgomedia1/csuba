import dotenv from 'dotenv';

dotenv.config();

// JWT secret is mandatory: a hardcoded fallback would let anyone forge tokens
// if the env var were ever missing in a deploy.
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error('JWT_SECRET is missing or too short (min 16 chars)');
  }
  return secret;
}

// Fail fast at import time so a misconfigured deploy never serves requests.
getJwtSecret();
