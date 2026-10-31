# alphaTab Web Samples

Samples for using [alphaTab](https://www.alphatab.net) in web projects: without a bundler, with the common bundlers, and with the common frameworks. Every sample renders the alphaTab demo song "Iron Waltz" and plays it, so each one exercises alphaTab's rendering worker, its synthesizer worker and its audio worklet. Each sample folder has a README with the setup details and the reasons behind them.

> **Version:** the samples target alphaTab **1.9** (`@coderline/alphatab`, `@coderline/alphatab-webpack`, `@coderline/alphatab-vite`), currently released as `@alpha`. For your own projects, use the `@latest` (stable) version unless you need an unreleased feature.

## Running a sample

```sh
cd src/<sample>
npm install
npm run dev      # development server
npm run build    # production build; see the sample's README for how to serve it
```

The `browser-*` samples need no installation, but they must be served by a web server (e.g. `npx http-server`), not opened from the file system.

## How alphaTab is integrated

alphaTab runs its rendering and synthesizer in a Web Worker and its audio output in an AudioWorklet. With a bundler, all three must load alphaTab's code, ideally as **one shared chunk** ("core copies" below; fewer is better):

- **webpack, Rspack, Rsbuild:** [`@coderline/alphatab-webpack`](https://www.npmjs.com/package/@coderline/alphatab-webpack) (one plugin for webpack 5 and Rspack 1/2).
- **Vite** (and frameworks built on it): [`@coderline/alphatab-vite`](https://www.npmjs.com/package/@coderline/alphatab-vite).
- **Other bundlers** (esbuild, Rollup, Parcel, Turbopack, Angular's application builder): the app owns small worker and worklet entry files that import `@coderline/alphatab/worker` and `@coderline/alphatab/worklet`, and initializes alphaTab from `@coderline/alphatab/core`, or alphaTab is loaded unbundled. The samples show the setup per tool.

## Samples

### Without a bundler

| Sample | Shows | Core copies |
|---|---|---|
| [`browser-simple-esm`](src/browser-simple-esm) | ES module from a CDN, render + play | 1 |
| [`browser-simple-umd`](src/browser-simple-umd) | `<script>` tag (UMD) from a CDN | 1 |
| [`browser-advanced-esm`](src/browser-advanced-esm) | ES module with a full player UI (tracks, transport, layout) | 1 |
| [`browser-advanced-umd`](src/browser-advanced-umd) | the same with the UMD build | 1 |
| [`node-simple-esm`](src/node-simple-esm) | Node.js (ESM): load a file and read the score model | – |
| [`node-simple-cjs`](src/node-simple-cjs) | the same with CommonJS | – |
| [`node-render-esm`](src/node-render-esm) | Node.js: render a score to PNG with alphaSkia | – |

### Bundlers

| Sample | Stack | Integration | Core copies |
|---|---|---|---|
| [`bundler-webpack-5`](src/bundler-webpack-5) | webpack 5 (≥ 5.90), HtmlWebpackPlugin | `@coderline/alphatab-webpack` | 1 |
| [`bundler-rspack-1`](src/bundler-rspack-1) | Rspack 1.7 | `@coderline/alphatab-webpack` | 1 |
| [`bundler-rspack-2`](src/bundler-rspack-2) | Rspack 2 | `@coderline/alphatab-webpack` | 1 |
| [`bundler-rsbuild-2`](src/bundler-rsbuild-2) | Rsbuild 2 (same config works on Rsbuild 1.7) | `@coderline/alphatab-webpack` via `tools.rspack` | 1 |
| [`bundler-vite-6`](src/bundler-vite-6) | Vite 6 | `@coderline/alphatab-vite` | 1 |
| [`bundler-vite-7`](src/bundler-vite-7) | Vite 7 | `@coderline/alphatab-vite` | 1 |
| [`bundler-vite-8`](src/bundler-vite-8) | Vite 8 | `@coderline/alphatab-vite` | 1 |
| [`bundler-esbuild`](src/bundler-esbuild) | esbuild | own worker/worklet entries, ESM splitting | 1 |
| [`bundler-rollup-4`](src/bundler-rollup-4) | Rollup 4 | own worker/worklet entries, ESM splitting | 1 |
| [`bundler-parcel-2`](src/bundler-parcel-2) | Parcel 2 | own worker/worklet entries (`worklet:` import) | 3 (Parcel bundles workers and worklets self-contained) |

### Frameworks

| Sample | Stack | Integration | Core copies |
|---|---|---|---|
| [`react-19-vite`](src/react-19-vite) | React 19 (React 18 works the same), Vite 8 | `@coderline/alphatab-vite` | 1 |
| [`nextjs-16-webpack`](src/nextjs-16-webpack) | Next.js 16 with `--webpack` | `@coderline/alphatab-webpack` | 1 (dev: 3) |
| [`nextjs-15-webpack`](src/nextjs-15-webpack) | Next.js 15 (webpack) | `@coderline/alphatab-webpack` | 1 (dev: 3) |
| [`nextjs-16-turbopack`](src/nextjs-16-turbopack) | Next.js 16 with Turbopack | own worker entry, copied worklet and core | 2 |
| [`vue-3-vite`](src/vue-3-vite) | Vue 3, Vite 8 | `@coderline/alphatab-vite` | 1 |
| [`nuxt-4`](src/nuxt-4) | Nuxt 4 (Vite 8), SSR | `@coderline/alphatab-vite` | 1 |
| [`nuxt-3`](src/nuxt-3) | Nuxt 3 (Vite 7), SSR | `@coderline/alphatab-vite` | 1 |
| [`angular-22-esbuild`](src/angular-22-esbuild) | Angular 22, application builder (esbuild), SSR | alphaTab external, import map, copied ES modules | 1 |
| [`angular-21-esbuild`](src/angular-21-esbuild) | Angular 21, application builder (esbuild) | alphaTab external, import map, copied ES modules | 1 |
| [`angular-20-esbuild`](src/angular-20-esbuild) | Angular 20, application builder (esbuild), Zone.js | alphaTab external, import map, copied ES modules | 1 |
| [`angular-22-webpack`](src/angular-22-webpack) | Angular 22, `@angular-builders/custom-webpack` (Angular's webpack builder is deprecated) | `@coderline/alphatab-webpack` with `alphaTabCore: false` | 2 |
| [`svelte-5-vite`](src/svelte-5-vite) | Svelte 5, Vite 8 | `@coderline/alphatab-vite` | 1 |
| [`sveltekit-3`](src/sveltekit-3) | SvelteKit 3 (Vite 8), SSR | `@coderline/alphatab-vite` | 1 |
| [`solid-1-vite`](src/solid-1-vite) | Solid 1.9, Vite 8 | `@coderline/alphatab-vite` | 1 |

## Things every setup needs

- **alphaTab is browser-only.** In frameworks with server-side rendering, create the API only on the client (an effect, `onMount`, `afterNextRender`, a `.client` component); each sample shows its framework's way.
- **Font and SoundFont.** The plugins copy them into the output; when the bundler writes scripts into a subfolder (Vite's `assets/`, Rsbuild's `static/js/`), set `core.fontDirectory` (and `player.soundFont`) to where they are served. The samples do.
- **All entry files must be loaded.** With webpack and Rspack the core is its own chunk of the page; HTML generated by HtmlWebpackPlugin, Rsbuild or Next.js includes it automatically, a hand-written `<script>` list must include it too.

## Not supported

- **Next.js with Turbopack and the webpack plugin:** Turbopack runs no webpack plugins. The [`nextjs-16-turbopack`](src/nextjs-16-turbopack) sample shows the manual setup; with webpack (`next dev --webpack`, `next build --webpack`) the plugin works.
- **Angular's application builder with alphaTab bundled:** the builder handles workers only in the app's own code and has no worklet support. The Angular esbuild samples keep alphaTab external instead.
