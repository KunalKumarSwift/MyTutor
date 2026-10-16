/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const apiTarget = process.env['MYTUTOR_API_URL'] ?? 'http://127.0.0.1:3000';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: true,
    // Same-origin in development too: the browser talks to Vite, which forwards /api.
    proxy: { '/api': { target: apiTarget, changeOrigin: false } },
  },
  preview: { port: 4173, proxy: { '/api': { target: apiTarget, changeOrigin: false } } },
  build: {
    target: 'es2022',
    // Never inline assets as data: URIs — the Content Security Policy only allows same-origin fonts/images.
    assetsInlineLimit: 0,
    sourcemap: true,
    rollupOptions: {
      output: {
        // Long-lived vendor chunks change rarely, so browsers keep them cached across deploys.
        manualChunks(id) {
          if (/node_modules\/(react|react-dom|scheduler|react-router)\//.test(id)) return 'react';
          if (id.includes('node_modules/@tanstack/')) return 'query';
          return undefined;
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.tsx', 'tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
    css: false,
  },
});
