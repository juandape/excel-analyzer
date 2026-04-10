import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        // Proceso main
        entry: 'electron/main.ts',
        onstart(options) {
          options.startup();
        },
        vite: {
          build: {
            outDir: 'dist-electron',
            sourcemap: process.env.NODE_ENV === 'development',
            rollupOptions: {
              external: ['keytar', 'electron'],
            },
          },
        },
      },
      {
        // Preload script
        entry: 'electron/preload.ts',
        onstart(options) {
          options.reload();
        },
        vite: {
          build: {
            outDir: 'dist-electron',
            sourcemap: process.env.NODE_ENV === 'development',
            rollupOptions: {
              external: ['keytar', 'electron'],
            },
          },
        },
      },
    ]),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
