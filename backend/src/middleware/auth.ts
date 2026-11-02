import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { getJwtSecret } from '../config.js';
import { query } from '../db/connection.js';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { userId?: string };
    if (!decoded.userId) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Admin-only endpoints (Apify scraper triggers). Two ways in:
//  - header x-admin-token = ADMIN_TOKEN (scripts/cron), or
//  - a logged-in user whose users.is_admin is true (checked in the DB on every
//    request, never trusted from the JWT, so revoking takes effect at once).
export async function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  const expected = process.env.ADMIN_TOKEN;
  if (expected && req.headers['x-admin-token'] === expected) return next();

  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (token) {
    try {
      const { userId } = jwt.verify(token, getJwtSecret()) as { userId?: string };
      if (userId) {
        const r = await query('SELECT is_admin FROM users WHERE id = $1', [userId]);
        if (r.rows[0]?.is_admin) {
          req.userId = userId;
          return next();
        }
      }
    } catch {
      /* invalid token → 403 below */
    }
  }
  res.status(403).json({ error: 'Forbidden' });
}
