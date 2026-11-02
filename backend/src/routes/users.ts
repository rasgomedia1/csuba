import express, { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.js';
import { HttpError, optNumber } from '../validation.js';

const router = express.Router();

const stringArray = (v: unknown, name: string): string[] | undefined => {
  if (v === undefined || v === null) return undefined;
  if (!Array.isArray(v) || v.length > 60 || !v.every((s) => typeof s === 'string' && s.length <= 100)) {
    throw new HttpError(400, `Invalid ${name}`);
  }
  return v;
};

router.get('/profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await authService.getUserById(req.userId!));
  } catch (error) {
    next(error);
  }
});

router.put('/preferences', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { investmentMin, investmentMax, provincePreferences, propertyTypePreferences } = req.body ?? {};
    const min = optNumber(investmentMin, 'investmentMin');
    const max = optNumber(investmentMax, 'investmentMax');
    if (min !== undefined && max !== undefined && min > max) throw new HttpError(400, 'investmentMin > investmentMax');

    const user = await authService.updateUserPreferences(
      req.userId!,
      min,
      max,
      stringArray(provincePreferences, 'provincePreferences'),
      stringArray(propertyTypePreferences, 'propertyTypePreferences')
    );
    res.json(user);
  } catch (error) {
    next(error);
  }
});

export default router;
