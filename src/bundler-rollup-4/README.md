# alphaTab with Rollup 4

A plain Rollup 4 browser app (JavaScript, no framework) that renders a Guitar Pro file and plays it back.
Rollup has no alphaTab plugin. The sample uses the same recipe as the [esbuild sample](../bundler-esbuild/): the app
owns the entry files of alphaTab's web worker and audio worklet and tells alphaTab how to start them.

Versions: Rollup 4.67, `@rollup/plugin-node-resolve` 16, `@rollup/plugin-terser` 1, alphaTab 1.9.

## Run

```sh
npm install
npm run dev      # rollup --watch, served on http://localhost:4185
npm run build    # production build into dist/
npm run preview  # serves dist/ on http://localhost:4185
```

## alphaTab setup

1. Worker and worklet entries ([src/alphaTab.worker.js](./src/alphaTab.worker.js),
   [src/alphaTab.worklet.js](./src/alphaTab.worklet.js)):

   ```js
   import '@coderline/alphatab/worker';
   ```
   ```js
   import '@coderline/alphatab/worklet';
   ```

2. The page ([src/main.js](./src/main.js)) imports `@coderline/alphatab/core` and registers the factories:

   ```js
   import * as alphaTab from '@coderline/alphatab/core';

   alphaTab.Environment.initializeMain(
     (_settings, nameHint) =>
       new Worker(new URL('./alphaTab.worker.js', import.meta.url), { type: 'module', name: nameHint }),
     (context) => context.audioWorklet.addModule(new URL('./alphaTab.worklet.js', import.meta.url)),
   );
   ```

3. All three files are inputs of one build with ESM output ([rollup.config.js](./rollup.config.js)). Rollup moves
   the shared alphaTab core into one chunk that the page, the worker (a module worker) and the worklet import:

   ```js
   export default {
     input: {
       main: 'src/main.js',
       'alphaTab.worker': 'src/alphaTab.worker.js',
       'alphaTab.worklet': 'src/alphaTab.worklet.js',
     },
     output: {
       dir: 'dist',
       format: 'esm',
       entryFileNames: '[name].js',
       chunkFileNames: '[name]-[hash].js',
     },
     plugins: [nodeResolve(), terser()],
   };
   ```

   Rollup does not rewrite `new URL('./file', import.meta.url)`; the URLs resolve at runtime relative to `main.js`,
   so the worker and worklet entries keep fixed names next to it.

4. The `copy-assets` plugin in the config copies `public/` and alphaTab's `font/` and `soundfont/` folders into
   `dist/`. The app sets `core.fontDirectory` and `player.soundFont` to those copies.

## Notes

- The default `@coderline/alphatab` import does not work with plain Rollup: alphaTab starts its worker from
  `new URL('./alphaTab.worker.mjs', import.meta.url)`, which Rollup leaves unchanged and does not emit. The request
  fails with 404 and the page stays empty; the console shows no error, only the network panel shows the failed
  worker request.
- The worker and worklet entries have no content hash in their file names. Serve them with revalidation
  (e.g. `Cache-Control: no-cache`) or add your own versioning.
