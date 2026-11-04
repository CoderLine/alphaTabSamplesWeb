# alphaTab with esbuild

A plain esbuild browser app (TypeScript, no framework) that renders a Guitar Pro file and plays it back.
esbuild has no alphaTab plugin. This sample shows the recipe for any bundler without plugin support: the app owns
the entry files of alphaTab's web worker and audio worklet, and tells alphaTab how to start them.

Versions: esbuild 0.28, TypeScript 7, alphaTab 1.9.

## Run

```sh
npm install
npm run dev      # esbuild watch + serve on http://localhost:4170
npm run build    # type check and production build into dist/
npm run preview  # serves dist/ on http://localhost:4170
```

## The recipe

alphaTab runs code in three places: the page, a web worker (rendering, synthesizer) and an audio worklet (audio
output). With a plugin (webpack, Rspack, Vite) the bundler discovers the worker and worklet inside alphaTab. Without
one, you provide them yourself:

1. **Worker entry** ([src/alphaTab.worker.ts](./src/alphaTab.worker.ts)):

   ```ts
   import '@coderline/alphatab/worker';
   ```

2. **Worklet entry** ([src/alphaTab.worklet.ts](./src/alphaTab.worklet.ts)):

   ```ts
   import '@coderline/alphatab/worklet';
   ```

3. **Page** ([src/main.ts](./src/main.ts)): import `@coderline/alphatab/core` (not `@coderline/alphatab`) and call
   `Environment.initializeMain` with factories for the emitted worker and worklet files, before creating the API:

   ```ts
   import * as alphaTab from '@coderline/alphatab/core';

   alphaTab.Environment.initializeMain(
     (_settings, nameHint) =>
       new Worker(new URL('./alphaTab.worker.js', import.meta.url), { type: 'module', name: nameHint }),
     (context) => context.audioWorklet.addModule(new URL('./alphaTab.worklet.js', import.meta.url)),
   );
   ```

   `@coderline/alphatab/core` exports the same API as `@coderline/alphatab` but does not initialize anything on its
   own. The default `@coderline/alphatab` entry registers worker and worklet URLs inside the alphaTab package, which
   only a plugin resolves; import `@coderline/alphatab/core` everywhere in the app instead.

4. **Bundle all three entries in one build** with code splitting and ESM output ([build.mjs](./build.mjs)):

   ```js
   await esbuild.build({
     entryPoints: ['src/main.ts', 'src/alphaTab.worker.ts', 'src/alphaTab.worklet.ts'],
     bundle: true,
     splitting: true,
     format: 'esm',
     outdir: 'dist',
     entryNames: '[name]',
     chunkNames: '[name]-[hash]',
   });
   ```

   `splitting` + `format: 'esm'` puts alphaTab's core into one chunk that the page, the worker and the worklet import,
   so the browser loads and compiles it once. Without splitting, each of the three outputs contains its own copy
   (about 1.2 MiB minified each). The worker is therefore a module worker (`type: 'module'`), and the worklet
   imports the chunk as an ES module, which audio worklets support.

   `entryNames: '[name]'` keeps the worker and worklet file names stable, because `main.ts` references them by
   name. esbuild does not rewrite `new URL('./file', import.meta.url)`; the URL resolves at runtime relative to
   `main.js`, so the worker and worklet must be emitted next to it. Chunks keep their content hash.
   The same command line: `esbuild src/main.ts src/alphaTab.worker.ts src/alphaTab.worklet.ts --bundle --splitting
   --format=esm --outdir=dist --entry-names=[name] --chunk-names=[name]-[hash]`.

5. **Copy the static assets**: `node_modules/@coderline/alphatab/dist/font/` to `dist/font/` and
   `node_modules/@coderline/alphatab/dist/soundfont/` to `dist/soundfont/` (`build.mjs` does this together with
   `public/`), and point alphaTab to them:

   ```ts
   const api = new alphaTab.AlphaTabApi(element, {
     core: {
       file: new URL('./iron-waltz.gp', import.meta.url).href,
       fontDirectory: new URL('./font/', import.meta.url).href,
     },
     player: {
       playerMode: alphaTab.PlayerMode.EnabledAutomatic,
       soundFont: new URL('./soundfont/sonivox.sf3', import.meta.url).href,
     },
   });
   ```

   Without `fontDirectory`, alphaTab looks for the font in a `font/` folder next to the chunk that contains its core.

## Notes

- `dev` uses esbuild's watch mode and built-in server; there is no hot reload.
- The worker and worklet entries have no content hash in their file names. Serve them with revalidation
  (e.g. `Cache-Control: no-cache`) or add your own versioning (e.g. a query string from the build).
- The same recipe applies to other bundlers without an alphaTab plugin, as long as they emit the three entries in
  one build with a shared ESM chunk.
