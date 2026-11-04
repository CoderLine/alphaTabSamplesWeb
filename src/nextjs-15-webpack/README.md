# alphaTab with Next.js 15 (webpack)

Loads and renders "Iron Waltz" (`public/iron-waltz.gp`, a Guitar Pro file of alphaTab's own demo song) and plays it back in a Next.js App Router page, bundled with webpack and the alphaTab webpack plugin.

| Package | Version |
| --- | --- |
| Next.js | 15.5 (webpack, the default of Next.js 15) |
| React | 19 |
| `@coderline/alphatab`, `@coderline/alphatab-webpack` | 1.9 |

## Run

```bash
npm install
npm run dev     # next dev
npm run build   # next build
npm run start   # serve the production build
```

## alphaTab setup

### `next.config.ts`

```ts
import { AlphaTabWebPackPlugin } from '@coderline/alphatab-webpack';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack(config) {
    config.plugins.push(
      new AlphaTabWebPackPlugin({
        assetOutputDir: 'public/alphatab'
      })
    );
    return config;
  }
};

export default nextConfig;
```

- Next.js 15 uses webpack for `next dev` and `next build` unless `--turbopack` is passed. Do not pass it: Turbopack does not run webpack plugins (see the `nextjs-16-webpack` sample for the Turbopack details).
- The plugin bundles alphaTab's render/synth web worker and its audio worklet. In the production build, page, workers and worklet share one alphaTab core chunk, so alphaTab's code is downloaded once.
- `assetOutputDir: 'public/alphatab'` copies the Bravura font and the SoundFont into `public/alphatab/`. Next.js serves static files from `public/` in dev and production; files the plugin emits into the webpack output are not served in dev ([vercel/next.js#45478](https://github.com/vercel/next.js/issues/45478)). The folder is generated on every build and dev start and is listed in `.gitignore`.

### Page (`src/app/page.tsx`, `src/app/ScoreViewer.tsx`)

- `page.tsx` stays a server component and renders `<ScoreViewer />`, a client component (`'use client'`).
- alphaTab is browser-only. A client component is still rendered on the server (and prerendered at build time), so `ScoreViewer` creates the `AlphaTabApi` in `useEffect`, which only runs in the browser, and destroys it in the effect cleanup. Importing `@coderline/alphatab` on the server is fine; only creating the API needs the DOM.
- `core.file` points to the score in `public/` (`/iron-waltz.gp`), `core.fontDirectory` and `player.soundFont` to the copied assets (`/alphatab/font/`, `/alphatab/soundfont/sonivox.sf2`). Prefix them with your [`basePath`](https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath) if you set one.

## Known limitations

- **Dev loads alphaTab three times.** `next dev` disables webpack's chunk splitting, so page, worker and worklet each contain their own copy of alphaTab's core (about 7 MB each, unminified). Production builds load one shared core chunk.
