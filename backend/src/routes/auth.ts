import express, { Request, Response } from 'express';
import * as authService from '../services/auth.js';

const router = express.Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, username, password, investmentMin, investmentMax, userPlan } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (userPlan && userPlan !== 'free' && userPlan !== 'donor') {
      return res.status(400).json({ error: 'Invalid userPlan' });
    }

    const user = await authService.registerUser(email, username, password, investmentMin, investmentMax, userPlan);

    res.status(201).json({
      message: 'User registered successfully',
      user
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    const result = await authService.loginUser(email, password);

    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

export default router;
