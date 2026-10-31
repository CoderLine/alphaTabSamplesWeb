# alphaTab with Parcel 2

A plain Parcel 2 browser app (TypeScript, no framework) that renders a Guitar Pro file and plays it back.
Parcel has no alphaTab plugin. The sample uses the same recipe as the [esbuild sample](../bundler-esbuild/): the app
owns the entry files of alphaTab's web worker and audio worklet and tells alphaTab how to start them.

Versions: Parcel 2.16, TypeScript 7, alphaTab 1.9.

## Run

```sh
npm install
npm run dev      # dev server on http://localhost:4180
npm run build    # type check and production build into dist/
npm run preview  # serves dist/ on http://localhost:4180
```

## alphaTab setup

1. Enable package `exports` in Parcel's resolver ([package.json](./package.json)); without it, Parcel cannot
   resolve `@coderline/alphatab/core`, `/worker` and `/worklet`:

   ```json
   "@parcel/resolver-default": {
     "packageExports": true
   }
   ```

2. Worker and worklet entries ([src/alphaTab.worker.ts](./src/alphaTab.worker.ts),
   [src/alphaTab.worklet.ts](./src/alphaTab.worklet.ts)):

   ```ts
   import '@coderline/alphatab/worker';
   ```
   ```ts
   import '@coderline/alphatab/worklet';
   ```

3. The page ([src/main.ts](./src/main.ts)) imports `@coderline/alphatab/core` and registers the factories. Parcel
   bundles the worker from `new Worker(new URL(...))` and the worklet from a `worklet:` import:

   ```ts
   import * as alphaTab from '@coderline/alphatab/core';
   import workletUrl from 'worklet:./alphaTab.worklet.ts';

   alphaTab.Environment.initializeMain(
     (_settings, nameHint) =>
       new Worker(new URL('./alphaTab.worker.ts', import.meta.url), { type: 'module', name: nameHint }),
     (context) => context.audioWorklet.addModule(workletUrl),
   );
   ```

   [src/worklet.d.ts](./src/worklet.d.ts) declares the `worklet:` imports for TypeScript.

4. Parcel has no step for copying static files. [copy-assets.mjs](./copy-assets.mjs) copies alphaTab's `font/` and
   `soundfont/` folders into `dist/` before `parcel serve` and `parcel build` (the dev server serves `dist/` too).
   The app points alphaTab to them with `core.fontDirectory: '/font/'` and
   `player.soundFont: '/soundfont/sonivox.sf3'`.

## Limitations

- **Three copies of alphaTab's core.** Page, worker and worklet each contain the core (about 1.2 MiB minified each).
  Parcel emits the worker as a self-contained classic script (it drops `type: 'module'`, also with modern
  browserslist targets) and a `worklet:` import as a self-contained module, so neither shares a bundle with the page.
- Loading the worklet with `addModule(new URL('./alphaTab.worklet.ts', import.meta.url))` instead of `worklet:` lets
  the page and the worklet share one bundle in production builds (two copies in total), but breaks the dev server:
  Parcel's development worklet bundle expects the shared bundle to be loaded already, which an audio worklet cannot
  do, and playback fails with "The node name 'alphatab' is not defined in AudioWorkletGlobalScope".
- The default `@coderline/alphatab` import does not work with Parcel: Parcel replaces `import.meta.url` with a
  `file://` URL of the source file at build time, so alphaTab cannot locate its scripts and starts neither worker nor
  player ("Could not detect alphaTab script file"). Use the recipe above.
