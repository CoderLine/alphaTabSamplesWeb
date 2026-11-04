import { defineConfig } from 'vite';
import { alphaTab } from '@coderline/alphatab-vite';

export default defineConfig({
  plugins: [alphaTab()],
  build: {
    // alphaTab's core chunk is about 1.2 MiB minified.
    chunkSizeWarningLimit: 1500,
  },
  server: { port: 4160 },
  preview: { port: 4160 },
});
