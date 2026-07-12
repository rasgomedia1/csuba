import app from './app.js';
import { initializeDatabase } from './db/index.js';

const PORT = process.env.PORT || 3000;

// Long-lived server entry for local development and VPS/self-hosted deploys.
// On Vercel the app is imported directly by api/index.ts (no listen()).
async function start() {
  try {
    await initializeDatabase();
    console.log('✅ Database connected');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

start();
