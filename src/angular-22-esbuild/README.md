# alphaTab with Angular 22 (application builder, SSR)

Renders the Guitar Pro file "Iron Waltz" (`public/iron-waltz.gp`) with alphaTab and plays it back, in an Angular
22 app built with the default application builder (`@angular/build:application`, esbuild) and server-side
rendering enabled.

- Angular 22, `@angular/build:application` and `@angular/build:dev-server`, `@angular/ssr` with Express
- `@coderline/alphatab` 1.9
- Standalone, zoneless component; `afterNextRender` for client-only creation

## Run

```sh
npm install
npm start               # dev server with SSR on http://localhost:4200
npm run build           # production build to dist/angular-22-esbuild
npm run serve:ssr       # serves the production build on http://localhost:4000
```

## How alphaTab is integrated

alphaTab renders in a Web Worker and synthesizes audio in an Audio Worklet. Both are started from alphaTab's
ES module with `new Worker(new URL('./alphaTab.worker.mjs', import.meta.url))` and
`audioWorklet.addModule(new URL('./alphaTab.worklet.mjs', import.meta.url))`.

Angular's application builder has no plugin API, and it bundles `new Worker(new URL(...))` only in your own
TypeScript files, not inside dependencies. When alphaTab is simply imported and bundled, the production build
still points to `./alphaTab.worker.mjs` next to `main-*.js`, the file does not exist, and the score never
renders (no error is reported). `ng serve` hides the problem: its Vite pre-bundling resolves the worker URL.

This sample therefore does not bundle alphaTab. The browser loads alphaTab's own ES modules, and the page,
the workers and the worklet share one copy of alphaTab's core (`alphaTab.core.mjs`):

1. **`angular.json` → `externalDependencies: ["@coderline/alphatab"]`** keeps `import ... from '@coderline/alphatab'`
   as a bare import in the output, for the browser and the server bundle.
2. **`angular.json` → `assets`** copies from `node_modules/@coderline/alphatab/dist`:
   - `alphaTab.mjs`, `alphaTab.core.mjs`, `alphaTab.worker.mjs`, `alphaTab.worklet.mjs` to `/alphatab/`,
   - the Bravura music font (`font/*`) to `/font/` (setting `core.fontDirectory`),
   - the SoundFont `soundfont/sonivox.sf3` to `/soundfont/` (setting `player.soundFont`).
3. **`src/index.html`** has an import map that resolves `@coderline/alphatab` to `/alphatab/alphaTab.mjs`.
   alphaTab then finds its worker and worklet next to that file.
4. **`angular.json` → `index.preloadInitial: false`**: otherwise the production build adds
   `<link rel="modulepreload" href="@coderline/alphatab">`, which browsers do not resolve through the import map;
   it fails with a MIME type error in the console.

TypeScript still type-checks against the installed package, and the initial bundle stays at about 160 kB, so
the default budgets apply.

### Server-side rendering

alphaTab needs the DOM, Web Workers and Web Audio, so the component creates it in `afterNextRender`, which runs
only in the browser, after hydration. `DestroyRef` destroys it again. The server renders the button and an
empty container.

- The server bundle imports `@coderline/alphatab` from `node_modules` at runtime (it is external), so deploy
  the server together with its installed dependencies.
- `security.allowedHosts` in `angular.json` lists `localhost` so that `npm run serve:ssr` answers local
  requests; add the host names of your deployment.

## Trade-offs and alternatives

- The files under `/alphatab/` keep their names across alphaTab versions and are not content-hashed. The
  generated `server.ts` serves static files with `maxAge: '1y'`; make sure browsers fetch the new files after
  an alphaTab update (shorter cache lifetime for `/alphatab/`, or a versioned output folder).
- The core is served unminified (2.5 MB, about 520 kB gzip). alphaTab's `*.min.mjs` entry files import the
  unminified `alphaTab.core.mjs`, so there is no minified set of files to copy instead.

Other setups that work with the application builder (verified with Angular 22), each with more copies of
alphaTab's core:

| Setup | Core copies |
| --- | --- |
| This sample: alphaTab external, import map | 1 |
| Bundle `@coderline/alphatab` normally, copy `alphaTab.core.mjs`, `alphaTab.worker.mjs` and `alphaTab.worklet.mjs` to the output root (`"output": "/"`), raise the `initial` budget to ~1.5 MB | 2 |
| Own worker entry (`src/app/alphatab.worker.ts` with `import '@coderline/alphatab/worker'`, created with `new Worker(new URL('./alphatab.worker', import.meta.url))`), app imports `@coderline/alphatab/core` and calls `alphaTab.Environment.initializeMain(...)`; the worklet is loaded from copied `alphaTab.worklet.mjs` + `alphaTab.core.mjs` because Angular cannot bundle worklet entries | 3 |

For webpack-based Angular builds with the alphaTab webpack plugin, see `angular-22-webpack`.
