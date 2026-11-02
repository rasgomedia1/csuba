import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { execSync } from 'child_process';
import pkg from './package.json';

// Build number = number of commits (or BUILD_NUMBER from CI). Shown on screen
// next to the version so two builds can always be told apart.
const buildNumber = (() => {
  if (process.env.BUILD_NUMBER) return process.env.BUILD_NUMBER;
  try {
    return execSync('git rev-list --count HEAD').toString().trim();
  } catch {
    return '0';
  }
})();

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __APP_BUILD__: JSON.stringify(buildNumber)
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Registered manually in main.tsx (skipped inside the Capacitor app).
      injectRegister: null,
      includeAssets: ['favicon.png', 'apple-touch-icon.png'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
        navigateFallbackDenylist: [/^\/api/]
      },
      manifest: {
        name: 'CSUBA - Subastas del BOE',
        short_name: 'CSUBA',
        description: 'Busca subastas del BOE con datos del Catastro, tasación, puja mínima y score de inversión.',
        lang: 'es',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0066ff',
        theme_color: '#0066ff',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      }
    })
  ],
  server: {
    port: 5174,
    strictPort: true,
    allowedHosts: ['.ngrok-free.dev', '.ngrok-free.app', '.ngrok.io'],
    proxy: {
      '/api': {
        target: 'http://localhost:4006',
        changeOrigin: true
      }
    }
  }
});
