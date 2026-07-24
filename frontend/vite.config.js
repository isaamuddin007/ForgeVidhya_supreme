import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config for the forgeVidhya SPA.
// - `server.proxy` forwards /api to the local backend in dev so cookies are
//   same-origin (no CORS/SameSite friction during development).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_DEV_API || 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // don't ship source maps to production
  },
});
