# alphaTab with Svelte 5 and Vite

Renders the Guitar Pro file "Iron Waltz" (`public/iron-waltz.gp`) and plays it back from a Svelte 5 component
(runes, `<script lang="ts">`), bundled with Vite and the alphaTab Vite plugin. Client-side rendering only; for
server-side rendering see `sveltekit-3`.

| Package | Version |
| --- | --- |
| Svelte | 5 (`@sveltejs/vite-plugin-svelte` 7) |
| Vite | 8 |
| TypeScript / svelte-check | 6 / 4 |
| `@coderline/alphatab`, `@coderline/alphatab-vite` | 1.9 |

## Run

```bash
npm install
npm run dev       # dev server
npm run build     # production build into dist/
npm run preview   # serve dist/
npm run check     # type-check (svelte-check, tsc)
```

## alphaTab setup

### `vite.config.ts`

```ts
import { alphaTab } from '@coderline/alphatab-vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [svelte(), alphaTab()],
});
```

The plugin

- bundles alphaTab's render/synth web worker and its audio worklet as chunks of the main build. Page, workers
  and worklet share one `alphaTab.core-*.js` chunk, so alphaTab's code is downloaded once;
- excludes alphaTab from Vite's dependency pre-bundling in dev, so the dev server serves the worker and worklet
  entries as they are;
- copies the Bravura font and the SoundFont into Vite's `publicDir` (`public/font`, `public/soundfont`) when the
  dev server or a build starts. These folders are generated and listed in `.gitignore`.

### Component (`src/App.svelte`)

- The host element is bound with `bind:this`. alphaTab is created in `onMount`, when the element exists; the
  function returned from `onMount` destroys it when the component is unmounted.
- The API instance is a plain variable, not `$state`: a `$state` object would be wrapped in a deep reactive proxy
  around alphaTab's internals. Only the UI state (player ready, playing) uses `$state`, updated from the
  `playerReady` and `playerStateChanged` events.
- `core.file`, `core.fontDirectory` and `player.soundFont` point to files in `public/`, prefixed with `import.meta.env.BASE_URL`
  so they still resolve when the app is deployed with a [`base`](https://vite.dev/config/shared-options.html#base).
  alphaTab cannot derive these paths itself, because the bundled script lives in `assets/`, not next to the fonts.

## Notes

- `vite build` warns that `alphaTab.core-*.js` is larger than 500 kB. That is expected: it is the whole alphaTab
  library (about 300 kB gzipped). Raise `build.chunkSizeWarningLimit` if the warning bothers you.
