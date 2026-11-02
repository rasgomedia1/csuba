import './config.js'; // validates required env vars before anything else
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import auctionRoutes from './routes/auctions.js';
import userRoutes from './routes/users.js';
import scraperRoutes from './routes/scrapers.js';
import { authMiddleware } from './middleware/auth.js';
import { HttpError } from './validation.js';

// The configured Express app, exported so it can run either as a long-lived
// server (server.ts, for local/VPS) or as a serverless handler on Vercel
// without starting an HTTP listener at import time.
const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

// CORS stays open because the native Android app calls this API cross-origin
// from the WebView; auth is by Bearer token (no cookies), so this is safe.
app.use(cors());
app.use(express.json({ limit: '100kb' }));

app.get(['/health', '/api/health'], (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/scrapers', scraperRoutes); // admin-only (see router)
app.use('/api/auctions', auctionRoutes); // public search/detail; watchlist routes need auth
app.use('/api/users', authMiddleware, userRoutes);

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handling: expected errors (HttpError, malformed JSON) keep their
// message; anything else is logged and returned as a generic 500 so internal
// details (SQL, stack) never reach the client.
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }
  if (err?.type === 'entity.parse.failed' || err?.type === 'entity.too.large') {
    return res.status(err.status || 400).json({ error: 'Invalid request body' });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
