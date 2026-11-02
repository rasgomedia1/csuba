import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'es.rasgomedia.csuba',
  appName: 'CSUBA',
  webDir: 'dist',
  server: {
    // Serve the WebView over http (not the default https) so that calling the
    // dev backend at http://10.0.2.2:3000 is a same-scheme request instead of
    // blocked mixed content. Combined with usesCleartextTraffic in the manifest,
    // this lets the emulated app reach the host loopback (10.0.2.2).
    androidScheme: 'http',
    cleartext: true
  }
};

export default config;
