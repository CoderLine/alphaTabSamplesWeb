# alphaTab with Solid and Vite

Renders the Guitar Pro file "Iron Waltz" (`public/iron-waltz.gp`) and plays it back from a Solid component,
bundled with Vite and the alphaTab Vite plugin. Client-side rendering only.

| Package | Version |
| --- | --- |
| Solid | 1.9 (`vite-plugin-solid` 2) |
| Vite | 8 |
| TypeScript | 7 |
| `@coderline/alphatab`, `@coderline/alphatab-vite` | 1.9 |

## Run

```bash
npm install
npm run dev       # dev server
npm run build     # type-check (tsc -b) and production build into dist/
npm run preview   # serve dist/
```

## alphaTab setup

### `vite.config.ts`

```ts
import { alphaTab } from '@coderline/alphatab-vite';
import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solid(), alphaTab()],
});
```

The plugin

- bundles alphaTab's render/synth web worker and its audio worklet as chunks of the main build. Page, workers
  and worklet share one `alphaTab.core-*.js` chunk, so alphaTab's code is downloaded once;
- excludes alphaTab from Vite's dependency pre-bundling in dev, so the dev server serves the worker and worklet
  entries as they are;
- copies the Bravura font and the SoundFont into Vite's `publicDir` (`public/font`, `public/soundfont`) when the
  dev server or a build starts. These folders are generated and listed in `.gitignore`.

### Component (`src/App.tsx`)

- The host element is assigned with `ref`. alphaTab is created in `onMount`, when the element exists, and
  destroyed in `onCleanup`.
- The API instance is a plain variable; only the UI state (player ready, playing) is held in signals, updated
  from the `playerReady` and `playerStateChanged` events.
- `core.file`, `core.fontDirectory` and `player.soundFont` point to files in `public/`, prefixed with
  `import.meta.env.BASE_URL` so they still resolve when the app is deployed with a
  [`base`](https://vite.dev/config/shared-options.html#base).

## Notes

- `vite build` warns that `alphaTab.core-*.js` is larger than 500 kB. That is expected: it is the whole alphaTab
  library (about 300 kB gzipped). Raise `build.chunkSizeWarningLimit` if the warning bothers you.
