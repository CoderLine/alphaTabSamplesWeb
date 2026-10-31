# alphaTab with Angular 20 (application builder)

Renders the Guitar Pro file "Iron Waltz" (`public/iron-waltz.gp`) with alphaTab and plays it back, in an Angular
20 app built with the default application builder (`@angular/build:application`, esbuild).

- Angular 20, `@angular/build:application` and `@angular/build:dev-server`
- `@coderline/alphatab` 1.9
- Standalone component with Zone.js change detection (the Angular 20 default); `afterNextRender` for client-only creation

The alphaTab setup is the same as in `angular-22-esbuild` (which also shows server-side rendering).

## Run

```sh
npm install
npm start          # dev server on http://localhost:4200
npm run build      # production build to dist/angular-20-esbuild/browser
```

## How alphaTab is integrated

alphaTab renders in a Web Worker and synthesizes audio in an Audio Worklet, started from alphaTab's ES module
with `new Worker(new URL('./alphaTab.worker.mjs', import.meta.url))` and
`audioWorklet.addModule(new URL('./alphaTab.worklet.mjs', import.meta.url))`. Angular's application builder has
no plugin API and bundles `new Worker(new URL(...))` only in your own TypeScript files, not inside dependencies.
A plain import of alphaTab therefore works with `ng serve` (Vite pre-bundling resolves the URLs) but not in the
production build: the worker file is missing and the score never renders.

The sample loads alphaTab's own ES modules instead of bundling them; page, workers and worklet share one copy of
alphaTab's core:

1. **`angular.json` → `externalDependencies: ["@coderline/alphatab"]`** keeps the import of
   `@coderline/alphatab` as a bare import in the output.
2. **`angular.json` → `assets`** copies from `node_modules/@coderline/alphatab/dist`:
   `alphaTab.min.mjs`, `alphaTab.core.min.mjs`, `alphaTab.worker.min.mjs` and `alphaTab.worklet.min.mjs` to
   `/alphatab/`,
   `font/*` to `/font/` (`core.fontDirectory`) and `soundfont/sonivox.sf3` to `/soundfont/` (`player.soundFont`).
3. **`src/index.html`** maps `@coderline/alphatab` to `/alphatab/alphaTab.min.mjs` with an import map.
   alphaTab then finds its worker and worklet next to that file.
4. **`angular.json` → `index.preloadInitial: false`** prevents a `<link rel="modulepreload" href="@coderline/alphatab">`
   in the production `index.html`; browsers do not resolve it through the import map and report an error.

The initial bundle stays at about 110 kB, so the default budgets apply.

The component creates alphaTab in `afterNextRender` (browser only, also when server-side rendering is added
later) and destroys it via `DestroyRef`.

The app uses Zone.js. The component creates alphaTab with `NgZone.runOutsideAngular`, so alphaTab's timers and
frequent events (e.g. the playback position) do not trigger change detection; the signals the component sets
from alphaTab events still update the view.

## Trade-offs

- The files under `/alphatab/` are not content-hashed; make sure browsers fetch the new files after an alphaTab
  update.
- The copied files are alphaTab's minified set: `alphaTab.min.mjs` imports `alphaTab.core.min.mjs` (1.2 MB,
  about 300 kB gzip) and starts `alphaTab.worker.min.mjs` and `alphaTab.worklet.min.mjs`, which import the same
  core. For debugging, copy `alphaTab.{mjs,core.mjs,worker.mjs,worklet.mjs}` and map `@coderline/alphatab` to
  `/alphatab/alphaTab.mjs` instead; each set references only its own files, so copy and map one set completely.
- Bundling alphaTab and copying `alphaTab.{core,worker,worklet}.mjs` to the output root also works (verified with
  Angular 22) but loads 2 copies of the core; see `angular-22-esbuild` for the comparison.
