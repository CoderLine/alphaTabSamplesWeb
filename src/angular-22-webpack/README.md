# alphaTab with Angular 22 (webpack, `@angular-builders/custom-webpack`)

Renders the Guitar Pro file "Iron Waltz" (`public/iron-waltz.gp`) with alphaTab and plays it back, in an Angular
22 app built with Angular's webpack-based browser builder and the alphaTab webpack plugin.

- Angular 22, `@angular-builders/custom-webpack:browser` and `:dev-server` 22 (on `@angular-devkit/build-angular`)
- `@coderline/alphatab` and `@coderline/alphatab-webpack` 1.9
- Standalone, zoneless component; `afterNextRender` for client-only creation

Angular deprecated its webpack support in v22: `@angular-devkit/build-angular` and its `browser` builder print
deprecation warnings during install and build. New projects should use the default application builder; see
`angular-22-esbuild`. This sample is for existing projects that stay on webpack.

## Run

```sh
npm install
npm start          # dev server on http://localhost:4200
npm run build      # production build to dist/angular-22-webpack
```

## How alphaTab is integrated

- **`angular.json`**: the `build` and `serve` targets use `@angular-builders/custom-webpack:browser` and
  `@angular-builders/custom-webpack:dev-server`; the build target takes `main` (not `browser`) and
  `customWebpackConfig.path: ./webpack.config.js`.
- **`webpack.config.js`** registers `AlphaTabWebPackPlugin` from `@coderline/alphatab-webpack`. It bundles
  alphaTab's Web Worker and Audio Worklet as worker entries (Angular disables webpack's worker parsing; the
  plugin re-enables it for alphaTab's modules only) and copies the Bravura font to `/font/` and the SoundFont
  to `/soundfont/`.
- **`optimization.splitChunks.cacheGroups.alphaTabCore = false`** is required. By default the plugin moves
  alphaTab's core into a split chunk that the page loads as an initial chunk. Angular's browser builder writes
  only its own named chunks (`runtime`, `polyfills`, `vendor`, `main`, ...) into `index.html`, so that chunk is
  never loaded and the app does not start (blank page, no error). With the cache group disabled, the core is
  bundled into `main` and once more into a chunk shared by the workers and the worklet: 2 copies of the core
  instead of 1.
- **Budgets**: `main` contains alphaTab (about 1.4 MB raw, 280 kB transfer), so the `initial` budget is raised
  to 1.5 MB (warning) / 2 MB (error).

The component creates alphaTab in `afterNextRender` (browser only) and destroys it via `DestroyRef`.
