# alphaTab with Nuxt 3

Loads and renders "Iron Waltz" (`public/iron-waltz.gp`, a Guitar Pro file of alphaTab's own demo song) and plays it back in a Nuxt 3 app with server-side rendering, bundled with Vite and the alphaTab Vite plugin.

| Package | Version |
| --- | --- |
| Nuxt | 3.21 (Vite 7) |
| Vue | 3.5 |
| `@coderline/alphatab`, `@coderline/alphatab-vite` | 1.9 |

## Run

```bash
npm install
npm run dev       # nuxt dev
npm run build     # nuxt build (server and client into .output/)
npm run preview   # run the built server (node .output/server/index.mjs)
```

## alphaTab setup

### `nuxt.config.ts`

```ts
import { createRequire } from 'node:module';
import path from 'node:path';
import { alphaTab } from '@coderline/alphatab-vite';

const alphaTabDist = path.dirname(createRequire(import.meta.url).resolve('@coderline/alphatab'));

export default defineNuxtConfig({
  vite: {
    plugins: [alphaTab({ assetOutputDir: false })]
  },
  nitro: {
    publicAssets: [
      { baseURL: 'font', dir: path.join(alphaTabDist, 'font'), maxAge: 60 * 60 * 24 * 7 },
      { baseURL: 'soundfont', dir: path.join(alphaTabDist, 'soundfont'), maxAge: 60 * 60 * 24 * 7 }
    ]
  }
});
```

- **`vite.plugins: [alphaTab(...)]`** registers the alphaTab Vite plugin. It bundles alphaTab's render/synth web worker and its audio worklet as chunks of the client build, so page, workers and worklet share one alphaTab core chunk. In dev it excludes alphaTab from dependency pre-bundling.
- **Fonts and SoundFont come from `nitro.publicAssets`**, served straight from `node_modules/@coderline/alphatab/dist` under the app base URL (`/font/`, `/soundfont/`) in dev, and copied into `.output/public` by `nuxt build`. The plugin's own copy step is disabled (`assetOutputDir: false`): Nuxt turns off Vite's `publicDir`, so the plugin has no default target, and this way no generated folder is needed. (If you let the plugin copy into `public/` instead, note that Nitro picks up `public/` only if it exists when the build starts: files copied into a folder that the build creates are missing from `.output`.)

### Component (`components/ScoreViewer.client.vue`)

- alphaTab is browser-only. The `.client.vue` suffix makes Nuxt render the component only in the browser and leave it out of the server bundle, so alphaTab is neither imported nor executed during server-side rendering. (`<ClientOnly>` around a normal component would also skip rendering on the server, but the server bundle would still import alphaTab.)
- A `.client` component renders its template only after it is mounted: `onMounted` waits for `nextTick()` before the template ref (`useTemplateRef`) points to the element.
- The API is held in a `shallowRef`, not a `ref()`, so Vue does not wrap alphaTab's objects in reactive proxies. It is destroyed in `onUnmounted`.
- `core.file`, `core.fontDirectory` and `player.soundFont` are prefixed with `useRuntimeConfig().app.baseURL`, so the paths follow a custom base URL (verified with `NUXT_APP_BASE_URL=/sub/`).

## Notes

- `nuxt build` warns that a chunk is larger than 500 kB. That is alphaTab's core (about 300 kB gzipped).
