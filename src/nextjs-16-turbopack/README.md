# alphaTab with Next.js 16 (Turbopack)

Loads and renders "Iron Waltz" (`public/iron-waltz.gp`, a Guitar Pro file of alphaTab's own demo song) and plays it back in a Next.js App Router page, bundled with Turbopack, the default bundler of Next.js 16.

Turbopack bundles alphaTab's Web Workers but not its Audio Worklet, and it cannot run the alphaTab webpack plugin. This sample copies the files Turbopack does not handle into `public/`. If you can use webpack (`next dev --webpack`, `next build --webpack`), prefer the `nextjs-16-webpack` sample: it needs no copy step and loads alphaTab once.

| Package | Version |
| --- | --- |
| Next.js | 16 (Turbopack) |
| React | 19 |
| `@coderline/alphatab` | 1.9 |

## Run

```bash
npm install
npm run dev     # copies the alphaTab assets, then next dev
npm run build   # copies the alphaTab assets, then next build
npm run start   # serve the production build
```

## What Turbopack does with alphaTab

- **Workers: bundled.** alphaTab detects Turbopack and starts its workers with `new Worker(new URL('./alphaTab.worker.mjs', import.meta.url), { type: 'module' })`. Turbopack bundles them, and they share alphaTab's core chunk with the page.
- **Audio Worklet: not bundled.** Turbopack copies the worklet entry referenced by `audioWorklet.addModule(new URL(...))` as a plain file whose import of alphaTab's core does not resolve. Under Turbopack, alphaTab therefore loads the worklet from `core.scriptFile`.
- **No plugin.** Turbopack does not run webpack plugins, so nothing copies the font and SoundFont either.

## alphaTab setup

### Assets (`scripts/copy-alphatab-assets.mjs`)

Runs before `dev` and `build` (`predev`, `prebuild`) and copies from `node_modules/@coderline/alphatab/dist` into `public/alphatab/`:

- `font/` and `soundfont/`, referenced by `core.fontDirectory` and `player.soundFont`;
- `alphaTab.mjs` and `alphaTab.core.mjs`, the entry the Audio Worklet loads (`core.scriptFile`) and the core it imports.

`public/alphatab/` is generated and listed in `.gitignore`.

### Component (`src/app/ScoreViewer.tsx`)

The client component imports `@coderline/alphatab` and points alphaTab to the copied files:

```ts
import * as alphaTab from '@coderline/alphatab';

const api = new alphaTab.AlphaTabApi(element, {
  core: {
    file: '/iron-waltz.gp',
    fontDirectory: '/alphatab/font/',
    scriptFile: '/alphatab/alphaTab.mjs'
  },
  player: {
    enablePlayer: true,
    enableCursor: true,
    soundFont: '/alphatab/soundfont/sonivox.sf2'
  }
});
```

The rest is the same as with webpack: `page.tsx` stays a server component, `ScoreViewer` is a client component that creates the `AlphaTabApi` in `useEffect` (client components are also rendered on the server; effects only run in the browser) and destroys it in the cleanup. Prefix the asset paths with your [`basePath`](https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath) if you set one.

## Known limitations

- **alphaTab is loaded twice.** Page and workers share one core chunk, but the Audio Worklet loads its own unbundled, unminified copy of the core from `public/alphatab/alphaTab.core.mjs` (about 2.5 MB).
- The copied files come from the installed `@coderline/alphatab`; they are refreshed on every `dev` and `build`, so they never drift from the bundled version.
- `next dev` in Next.js 16.4 writes an `AGENTS.md` into the project folder (set `agentRules: false` in `next.config.ts` to disable it). It is unrelated to alphaTab.
