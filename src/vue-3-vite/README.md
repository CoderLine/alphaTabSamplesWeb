# alphaTab with Vue 3 and Vite

Loads and renders "Iron Waltz" (`public/iron-waltz.gp`, a Guitar Pro file of alphaTab's own demo song) and plays it back from a Vue single-file component (`<script setup lang="ts">`), bundled with Vite and the alphaTab Vite plugin.

| Package | Version |
| --- | --- |
| Vue | 3.5 |
| Vite | 8 (`@vitejs/plugin-vue` 6) |
| TypeScript / vue-tsc | 6 / 3 |
| `@coderline/alphatab`, `@coderline/alphatab-vite` | 1.9 |

## Run

```bash
npm install
npm run dev       # dev server
npm run build     # type-check (vue-tsc) and production build into dist/
npm run preview   # serve dist/
```

## alphaTab setup

### `vite.config.ts`

```ts
import { alphaTab } from '@coderline/alphatab-vite';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vue(), alphaTab()]
});
```

The plugin

- bundles alphaTab's render/synth web worker and its audio worklet as chunks of the main build. Page, workers and worklet share one `alphaTab.core-*.js` chunk, so alphaTab's code is downloaded once;
- excludes alphaTab from Vite's dependency pre-bundling in dev, so the dev server serves the worker and worklet entries as they are;
- copies the Bravura font and the SoundFont into Vite's `publicDir` (`public/font`, `public/soundfont`) when the dev server or a build starts. These folders are generated and listed in `.gitignore`.

### Component (`src/App.vue`)

- The host element is a typed template ref (`useTemplateRef<HTMLDivElement>('score')`). alphaTab is created in `onMounted`, when the element exists, and destroyed in `onUnmounted`.
- The API is held in a `shallowRef<AlphaTabApi>()`, not a `ref()`. `ref()` makes the value deeply reactive, so Vue would wrap the API and every object reached through it (score model, settings, renderer) in proxies, which costs performance and lets alphaTab's internals run on proxies instead of its own objects. Only the UI state (player ready, playing) uses `ref()`, updated from `playerReady` and `playerStateChanged`.
- `core.file` points to the score in `public/`, `core.fontDirectory` and `player.soundFont` to the copied assets, all prefixed with `import.meta.env.BASE_URL` so they still resolve when the app is deployed with a [`base`](https://vite.dev/config/shared-options.html#base). alphaTab cannot derive these paths itself, because the bundled script lives in `assets/`, not next to the fonts.

## Notes

- TypeScript stays on 6: `vue-tsc` 3 fails to start with TypeScript 7 (the native compiler no longer ships the JavaScript compiler API vue-tsc builds on). `create-vite` also pins its Vue template to TypeScript 6.
- `vite build` warns that `alphaTab.core-*.js` is larger than 500 kB. That is expected: it is the whole alphaTab library (about 300 kB gzipped). Raise `build.chunkSizeWarningLimit` if the warning bothers you.
- alphaTab is browser-only. For server-side rendering see the Nuxt samples.
