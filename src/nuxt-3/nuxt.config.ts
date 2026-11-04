import { createRequire } from 'node:module';
import path from 'node:path';
import { alphaTab } from '@coderline/alphatab-vite';

const alphaTabDist = path.dirname(createRequire(import.meta.url).resolve('@coderline/alphatab'));

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  vite: {
    // Nitro serves the font and SoundFont (see nitro.publicAssets); the plugin only bundles worker and worklet.
    plugins: [alphaTab({ assetOutputDir: false })]
  },
  nitro: {
    publicAssets: [
      { baseURL: 'font', dir: path.join(alphaTabDist, 'font'), maxAge: 60 * 60 * 24 * 7 },
      { baseURL: 'soundfont', dir: path.join(alphaTabDist, 'soundfont'), maxAge: 60 * 60 * 24 * 7 }
    ]
  }
});
