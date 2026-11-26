/* global process */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Inside Docker this is http://server:4000 (set in docker-compose.yml).
// Outside Docker it falls back to the API on your machine.
const proxyTarget = process.env.VITE_PROXY_TARGET || 'http://localhost:4000';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    watch: {
      // File events do not always reach containers on Windows bind mounts.
      usePolling: process.env.CHOKIDAR_USEPOLLING === 'true',
    },
    proxy: {
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
      },
    },
  },
});