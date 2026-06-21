import express, { Request, Response } from 'express';
import * as authService from '../services/auth.js';

const router = express.Router();

router.get('/profile', async (req: Request, res: Response) => {
  try {
    const user = await authService.getUserById(req.userId!);
    res.json(user);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.put('/preferences', async (req: Request, res: Response) => {
  try {
    const { investmentMin, investmentMax, provincePreferences, propertyTypePreferences } = req.body;

    const user = await authService.updateUserPreferences(
      req.userId!,
      investmentMin,
      investmentMax,
      provincePreferences,
      propertyTypePreferences
    );

    res.json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
