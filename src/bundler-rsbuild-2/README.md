# alphaTab with Rsbuild 2

A plain Rsbuild 2 browser app (TypeScript, no framework) that renders a Guitar Pro file and plays it back.
Rsbuild runs on Rspack, so alphaTab's webpack plugin
[`@coderline/alphatab-webpack`](https://www.npmjs.com/package/@coderline/alphatab-webpack) is added to the Rspack
configuration through `tools.rspack`. The project follows the `create-rsbuild` vanilla TypeScript template.

Versions: Rsbuild 2.3 (Rspack 2.3), TypeScript 7, alphaTab 1.9.
The same configuration was also verified with Rsbuild 1.7 (Rspack 1.7); no separate sample is needed for it.

## Run

```sh
npm install
npm run dev      # dev server on http://localhost:4130
npm run build    # production build into dist/
npm run preview  # serves dist/ on http://localhost:4130
```

## alphaTab setup

[rsbuild.config.ts](./rsbuild.config.ts):

```ts
import { defineConfig } from '@rsbuild/core';
import { AlphaTabWebPackPlugin } from '@coderline/alphatab-webpack';

export default defineConfig({
  html: { template: './index.html' },
  tools: {
    rspack: (_config, { appendPlugins }) => {
      appendPlugins(new AlphaTabWebPackPlugin());
    },
  },
});
```

What the plugin does:

- Bundles alphaTab's web worker and audio worklet as separate entries.
- Moves alphaTab's core into one `alphaTabCore` split chunk that the page, the workers and the worklet load, instead of
  one copy per runtime. Rsbuild's own chunk splitting stays as configured; the plugin only adds its cache group.
- Copies the Bravura font to `dist/font/` and the SoundFonts to `dist/soundfont/`, and serves them in the dev server.

Rsbuild's HTML generation loads every file of the entrypoint, which the shared core chunk needs.

The app code ([src/index.ts](./src/index.ts)) sets the font and SoundFont locations explicitly:

```ts
const api = new alphaTab.AlphaTabApi(element, {
  core: {
    file: new URL('./iron-waltz.gp', import.meta.url).href,
    fontDirectory: '/font/',
  },
  player: {
    playerMode: alphaTab.PlayerMode.EnabledAutomatic,
    soundFont: '/soundfont/sonivox.sf3',
  },
});
```

`fontDirectory` is required here: alphaTab looks for the font next to its script by default, and Rsbuild emits
scripts into `dist/static/js/`, while the plugin copies the font to `dist/font/`. Without the setting, the font
requests go to `/static/js/font/` and fail with 404, and nothing is rendered.

## Notes

- If `npm install` reports an `ERESOLVE` peer conflict for `@rspack/core`, or installs a second `@rspack/core`, the
  installed `@coderline/alphatab-webpack` predates Rspack 2 support; update it.
