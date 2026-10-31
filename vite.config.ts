import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    base: './',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    build: {
      // Split the code into a ton of small chunks to maximize web requests
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Split node_modules into individual vendor packages
            if (id.includes('node_modules')) {
              if (id.includes('lucide-react')) return 'vendor-lucide';
              if (id.includes('react-dom')) return 'vendor-react-dom';
              if (id.includes('react/')) return 'vendor-react-core';
              const match = id.match(/node_modules\/([^/]+)/);
              if (match) {
                return `vendor-${match[1].replace(/[@.]/g, '-')}`;
              }
              return 'vendor-misc';
            }
            // Split components into separate chunks
            if (id.includes('/src/components/')) {
              const compMatch = id.match(/\/src\/components\/([^/.]+)/);
              if (compMatch) {
                return `chunk-comp-${compMatch[1].toLowerCase()}`;
              }
            }
            // Split utils & context into individual chunks
            if (id.includes('/src/utils/')) {
              const utilMatch = id.match(/\/src\/utils\/([^/.]+)/);
              if (utilMatch) {
                return `chunk-util-${utilMatch[1].toLowerCase()}`;
              }
            }
            if (id.includes('/src/context/')) {
              const ctxMatch = id.match(/\/src\/context\/([^/.]+)/);
              if (ctxMatch) {
                return `chunk-ctx-${ctxMatch[1].toLowerCase()}`;
              }
            }
          },
        },
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
