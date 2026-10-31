# alphaTab with Next.js 16 (webpack)

Loads and renders "Iron Waltz" (`public/iron-waltz.gp`, a Guitar Pro file of alphaTab's own demo song) and plays it back in a Next.js App Router page, bundled with webpack and the alphaTab webpack plugin.

| Package | Version |
| --- | --- |
| Next.js | 16 (run with `--webpack`) |
| React | 19 |
| `@coderline/alphatab`, `@coderline/alphatab-webpack` | 1.9 |

## Run

```bash
npm install
npm run dev     # next dev --webpack
npm run build   # next build --webpack
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

- Next.js 16 builds with Turbopack by default, which does not run webpack plugins. The `--webpack` flag in the `dev` and `build` scripts selects webpack. Without it, `next build` stops with "This build is using Turbopack, with a `webpack` config and no `turbopack` config". See [Turbopack](#turbopack) below.
- The plugin bundles alphaTab's render/synth web worker and its audio worklet. In the production build, page, workers and worklet share one alphaTab core chunk, so alphaTab's code is downloaded once.
- `assetOutputDir: 'public/alphatab'` copies the Bravura font and the SoundFont into `public/alphatab/`. Next.js serves static files from `public/` in dev and production; files the plugin emits into the webpack output are not served in dev ([vercel/next.js#45478](https://github.com/vercel/next.js/issues/45478)). The folder is generated on every build and dev start and is listed in `.gitignore`.
- The `webpack()` hook runs for the client and the server compilations. The plugin is applied to both: it only matters for the client, and skipping it for the server (`isServer`) did not make the server output smaller, so one code path is kept.

### Page (`src/app/page.tsx`, `src/app/ScoreViewer.tsx`)

- `page.tsx` stays a server component and renders `<ScoreViewer />`, a client component (`'use client'`).
- alphaTab is browser-only. A client component is still rendered on the server (and prerendered at build time), so `ScoreViewer` must not touch alphaTab during render: it creates the `AlphaTabApi` in `useEffect`, which only runs in the browser, and destroys it in the effect cleanup. Importing `@coderline/alphatab` on the server is fine; only creating the API needs the DOM.
- The `AlphaTabApi` is kept in a ref, the UI state (player ready, playing) in React state.
- `core.file` points to the score in `public/` (`/iron-waltz.gp`), `core.fontDirectory` and `player.soundFont` to the copied assets (`/alphatab/font/`, `/alphatab/soundfont/sonivox.sf2`). Prefix them with your [`basePath`](https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath) if you set one.

## Known limitations

- **Dev loads alphaTab three times.** `next dev` disables webpack's chunk splitting, so page, worker and worklet each contain their own copy of alphaTab's core (about 7 MB each, unminified). Production builds (`next build`) load one shared core chunk. This only affects dev load times.
- `next dev` in Next.js 16.4 writes an `AGENTS.md` into the project folder (set `agentRules: false` in `next.config.ts` to disable it). It is unrelated to alphaTab.

## Turbopack

Turbopack, the default bundler of Next.js 16, cannot run the alphaTab webpack plugin:

- alphaTab detects Turbopack and starts its workers in the form Turbopack bundles (`new Worker(new URL(...), { type: 'module' })`); they share alphaTab's core chunk with the page.
- Turbopack has no Audio Worklet support: `audioWorklet.addModule(new URL(...))` is copied as an unbundled file, whose import of alphaTab's core does not resolve. Under Turbopack, alphaTab loads the worklet from `core.scriptFile` instead, which must point to a copy of alphaTab's ES module.
- `turbopack.rules` only configures webpack loaders, which cannot add worker or worklet entries, and nothing copies the font and SoundFont.

The `nextjs-16-turbopack` sample shows that setup: a script copies the font, the SoundFont and alphaTab's ES module into `public/`, and the worklet loads a second copy of alphaTab's core. With the webpack plugin (this sample) no copy step is needed and alphaTab is loaded once, so webpack remains the recommended bundler for Next.js.
