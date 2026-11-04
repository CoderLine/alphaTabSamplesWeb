import { alphaTab } from '@coderline/alphatab-vite';
import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solid(), alphaTab()],
});
