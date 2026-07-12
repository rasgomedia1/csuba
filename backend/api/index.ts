// Vercel serverless entry. An Express app instance is itself a valid
// (req, res) request handler, so exporting it as the default handler lets
// Vercel route every /api/* request through the same app used locally.
// Requires DATABASE_URL to point at Neon's *pooled* endpoint (see vercel.json notes).
import app from '../src/app.js';

export default app;
