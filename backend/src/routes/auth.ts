import express, { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.js';
import { HttpError, isEmail, optNumber, optString } from '../validation.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = express.Router();

// 10 attempts per 15 min per IP on login/register.
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

const USERNAME_RE = /^[A-Za-z0-9_.-]{3,30}$/;

router.post('/register', authLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, username, password, investmentMin, investmentMax, userPlan } = req.body ?? {};

    if (!email || !username || !password) throw new HttpError(400, 'Missing required fields');
    if (!isEmail(email)) throw new HttpError(400, 'Invalid email');
    if (typeof username !== 'string' || !USERNAME_RE.test(username)) throw new HttpError(400, 'Invalid username');
    if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
      throw new HttpError(400, 'Password must be 8-128 characters');
    }
    if (userPlan !== undefined && userPlan !== 'free' && userPlan !== 'donor') {
      throw new HttpError(400, 'Invalid userPlan');
    }

    const min = optNumber(investmentMin, 'investmentMin');
    const max = optNumber(investmentMax, 'investmentMax');
    if (min !== undefined && max !== undefined && min > max) throw new HttpError(400, 'investmentMin > investmentMax');

    const user = await authService.registerUser(email.trim(), username.trim(), password, min, max, userPlan);
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    next(error);
  }
});

router.post('/login', authLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // `identifier` is the new field ("Email or User"); `email` stays accepted
    // for clients already installed.
    const identifier = optString(req.body?.identifier, 255) ?? optString(req.body?.email, 255);
    const password = req.body?.password;

    if (!identifier || typeof password !== 'string' || !password) {
      throw new HttpError(400, 'Missing credentials');
    }

    res.json(await authService.loginUser(identifier, password));
  } catch (error) {
    next(error);
  }
});

export default router;
