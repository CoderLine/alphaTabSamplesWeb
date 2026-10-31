# alphaTab with Next.js 16 (Turbopack)

Loads and renders "Iron Waltz" (`public/iron-waltz.gp`, a Guitar Pro file of alphaTab's own demo song) and plays it back in a Next.js App Router page, bundled with Turbopack, the default bundler of Next.js 16.

Turbopack cannot run the alphaTab webpack plugin, so this sample wires alphaTab's worker and worklet by hand. If you can use webpack (`next dev --webpack`, `next build --webpack`), prefer the `nextjs-16-webpack` sample: it needs no extra code and loads alphaTab once.

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

## Why alphaTab needs extra setup with Turbopack

- **No plugin.** Turbopack does not run webpack plugins; `turbopack.rules` only configures loaders, which cannot add worker or worklet entries. Nothing copies the font and SoundFont either.
- **Automatic initialization fails.** Turbopack compiles `import.meta.url` in client code to a `file:///ROOT/...` URL. With the default `@coderline/alphatab` import, alphaTab therefore does not detect that it runs as an ES module and never starts its module workers: rendering falls back to the main thread and playback fails ("Could not detect alphaTab script file").
- **No worklet bundling.** Turbopack bundles `new Worker(new URL(...), { type: 'module' })`, but not audio worklets: `audioWorklet.addModule(new URL(...))` is copied as an unbundled file whose import of alphaTab's core does not resolve.

## alphaTab setup

### Assets (`scripts/copy-alphatab-assets.mjs`)

Runs before `dev` and `build` (`predev`, `prebuild`) and copies from `node_modules/@coderline/alphatab/dist` into `public/alphatab/`:

- `font/` and `soundfont/`, referenced by `core.fontDirectory` and `player.soundFont`;
- `alphaTab.worklet.mjs` and `alphaTab.core.mjs`, the unbundled worklet entry and the core it imports.

`public/alphatab/` is generated and listed in `.gitignore`.

### Worker entry (`src/app/alphaTab.worker.ts`)

```ts
import '@coderline/alphatab/worker';
```

### Initialization (`src/app/ScoreViewer.tsx`)

The client component imports `@coderline/alphatab/core`, which does not initialize itself, and hands alphaTab the worker and worklet factories before creating the API:

```ts
import * as alphaTab from '@coderline/alphatab/core';

alphaTab.Environment.initializeMain(
  (_settings, name) => new Worker(new URL('./alphaTab.worker.ts', import.meta.url), { type: 'module', name }),
  context => context.audioWorklet.addModule('/alphatab/alphaTab.worklet.mjs')
);
```

- Turbopack bundles the worker from `alphaTab.worker.ts` and lets it share alphaTab's core chunk with the page.
- The worklet loads the files copied to `public/alphatab/`.
- `initializeMain` only stores the factories; calling it again (e.g. on every mount) is harmless.

The rest is the same as with webpack: `page.tsx` stays a server component, `ScoreViewer` is a client component that creates the `AlphaTabApi` in `useEffect` (client components are also rendered on the server; effects only run in the browser) and destroys it in the cleanup. Prefix the asset paths with your [`basePath`](https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath) if you set one.

## Known limitations

- **alphaTab is loaded twice.** Page and workers share one core chunk, but the worklet loads its own unbundled, unminified copy of the core from `public/alphatab/alphaTab.core.mjs` (about 2.5 MB).
- The copied worklet and core come from the installed `@coderline/alphatab`; they are refreshed on every `dev` and `build`, so they never drift from the bundled version.
- `next dev` in Next.js 16.4 writes an `AGENTS.md` into the project folder (set `agentRules: false` in `next.config.ts` to disable it). It is unrelated to alphaTab.
