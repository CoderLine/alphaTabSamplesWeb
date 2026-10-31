# alphaTab with Rspack 1

A plain Rspack 1.7 browser app (TypeScript, no framework) that renders a Guitar Pro file and plays it back.
Rspack is webpack-compatible, so it uses the same plugin as webpack:
[`@coderline/alphatab-webpack`](https://www.npmjs.com/package/@coderline/alphatab-webpack).
The project follows the `create-rspack@1` vanilla TypeScript template. For new projects prefer
[Rspack 2](../bundler-rspack-2/); the alphaTab setup is the same.

Versions: Rspack 1.7.12 (`@rspack/cli`, `@rspack/core`), TypeScript 7, alphaTab 1.9.
Also verified with Rspack 1.7.0.

## Run

```sh
npm install
npm run dev      # dev server on http://localhost:4110
npm run build    # production build into dist/
npm run preview  # serves dist/ on http://localhost:4110
```

## alphaTab setup

[rspack.config.ts](./rspack.config.ts):

```ts
import { rspack } from '@rspack/core';
import { AlphaTabWebPackPlugin } from '@coderline/alphatab-webpack';

export default defineConfig({
  // ...
  plugins: [
    new rspack.HtmlRspackPlugin({ template: './index.html' }),
    new AlphaTabWebPackPlugin(),
  ],
});
```

What the plugin does:

- Bundles alphaTab's web worker and audio worklet as separate entries.
- Moves alphaTab's core into one `alphaTabCore` split chunk that the page, the workers and the worklet load, instead of
  one copy per runtime. For that it sets `optimization.usedExports = 'global'` in production builds when you did not
  configure it (it warns if you set it to `true`, which would duplicate the core).
- Copies the Bravura font to `dist/font/` and the SoundFonts to `dist/soundfont/`, and serves them in the dev server.

Because the core is a split chunk of the entrypoint, the HTML must load every file of the entrypoint.
`HtmlRspackPlugin` does this. If you write the `<script>` tags yourself, include all files of the entrypoint.

The app code ([src/index.ts](./src/index.ts)) uses the normal `@coderline/alphatab` import. The SoundFont URL points to
the copy made by the plugin; the font is found automatically next to the scripts.

`performance`: alphaTab's core chunk is about 1.2 MiB minified, above the default 244 KiB budget. The sample raises
the budget for JavaScript and excludes fonts and SoundFonts, which load on demand.

## Notes

- Opting out of the shared core: `optimization.splitChunks.cacheGroups.alphaTabCore = false` (then the page and the
  workers each include a copy of the core).
