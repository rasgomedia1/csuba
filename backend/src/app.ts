import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import auctionRoutes from './routes/auctions.js';
import userRoutes from './routes/users.js';
import scraperRoutes from './routes/scrapers.js';
import { authMiddleware } from './middleware/auth.js';

dotenv.config();

// The configured Express app, exported so it can run either as a long-lived
// server (server.ts, for local/VPS) or as a serverless handler (api/index.ts,
// for Vercel) without starting an HTTP listener at import time.
const app = express();

// Middleware. CORS stays open because the native Android app calls this API
// cross-origin from the WebView; the web frontend is same-origin on Vercel.
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public routes
app.use('/api/auth', authRoutes);
app.use('/api/scrapers', scraperRoutes);

// Protected routes
app.use('/api/auctions', auctionRoutes);
app.use('/api/users', authMiddleware, userRoutes);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

export default app;
