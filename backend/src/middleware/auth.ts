import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { getJwtSecret } from '../config.js';

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

// Admin-only endpoints (Apify scraper triggers). Disabled entirely unless
// ADMIN_TOKEN is configured, so they can never be called anonymously.
export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) {
    return res.status(503).json({ error: 'Admin endpoints disabled' });
  }
  if (req.headers['x-admin-token'] !== expected) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}
