# alphaTab with Vite 7

A plain Vite 7 browser app (vanilla TypeScript, no framework) that renders a Guitar Pro file and plays it back.
It uses [`@coderline/alphatab-vite`](https://www.npmjs.com/package/@coderline/alphatab-vite) so that alphaTab's
render worker and audio worklet are bundled correctly and share one alphaTab core chunk with the page.
The project follows the `create-vite` vanilla TypeScript template. Vite 7 builds with Rollup.

Versions: Vite 7.3, TypeScript 7, alphaTab 1.9. Also verified with Vite 7.0.0.

## Run

```sh
npm install
npm run dev      # dev server on http://localhost:4150
npm run build    # type check and production build into dist/
npm run preview  # serves dist/ on http://localhost:4150
```

## alphaTab setup

[vite.config.ts](./vite.config.ts):

```ts
import { defineConfig } from 'vite';
import { alphaTab } from '@coderline/alphatab-vite';

export default defineConfig({
  plugins: [alphaTab()],
  build: {
    // alphaTab's core chunk is about 1.2 MiB minified.
    chunkSizeWarningLimit: 1500,
  },
});
```

What the plugin does:

- Emits alphaTab's web worker and audio worklet as chunks of the main build. Page, worker and worklet import the same
  `alphaTab.core-[hash].js` chunk.
- In the dev server, excludes alphaTab from dependency pre-bundling so that the worker and worklet load the same
  `alphaTab.core.mjs` module as the page.
- Copies the Bravura font and the SoundFonts from `@coderline/alphatab` into the public directory
  (`public/font/`, `public/soundfont/`), so they are served in dev and end up in `dist/font/` and
  `dist/soundfont/`. The copies are generated; [.gitignore](./.gitignore) excludes them.

`build.chunkSizeWarningLimit` only silences Vite's 500 kB warning for alphaTab's core chunk.

The app code ([src/main.ts](./src/main.ts)) sets the font and SoundFont locations:

```ts
const api = new alphaTab.AlphaTabApi(element, {
  core: {
    file: new URL('./iron-waltz.gp', import.meta.url).href,
    fontDirectory: `${import.meta.env.BASE_URL}font/`,
  },
  player: {
    playerMode: alphaTab.PlayerMode.EnabledAutomatic,
    soundFont: `${import.meta.env.BASE_URL}soundfont/sonivox.sf3`,
  },
});
```

`fontDirectory` is required for production builds: alphaTab looks for the font next to its script by default.
In the dev server that is `node_modules/@coderline/alphatab/dist/font/`, which happens to exist, but a build emits
the scripts into `dist/assets/`, so without the setting the font requests go to `/assets/font/` and fail with 404,
and nothing is rendered. Prefixing the paths with `import.meta.env.BASE_URL` keeps them correct for any Vite `base`
(verified with the default `/` and with `base: './'` served from a sub-path).
