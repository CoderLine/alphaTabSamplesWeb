# alphaTab with SvelteKit 3

Renders the Guitar Pro file "Iron Waltz" (`static/iron-waltz.gp`) and plays it back on a server-side rendered
SvelteKit page, bundled with Vite and the alphaTab Vite plugin, served by `@sveltejs/adapter-node`.

| Package | Version |
| --- | --- |
| SvelteKit | 3 (`@sveltejs/adapter-node` 6) |
| Svelte | 5 (`@sveltejs/vite-plugin-svelte` 7) |
| Vite | 8 |
| TypeScript / svelte-check | 6 / 4 |
| `@coderline/alphatab`, `@coderline/alphatab-vite` | 1.9 |

## Run

```bash
npm install
npm run dev       # dev server with SSR
npm run build     # production build into build/
npm run preview   # serve the production build with Vite
npm start         # serve the production build with Node (adapter-node, port 3000 or $PORT)
npm run check     # type-check (svelte-check)
```

## alphaTab setup

### `vite.config.ts`

SvelteKit 3 takes its configuration in the `sveltekit()` plugin options. The alphaTab plugin is added next to it:

```ts
export default defineConfig({
  plugins: [
    sveltekit({
      // ...
      adapter: adapter()
    }),
    alphaTab()
  ]
});
```

The plugin bundles alphaTab's render/synth web worker and its audio worklet as chunks of the client build (page,
workers and worklet share one core chunk), excludes alphaTab from dependency pre-bundling in dev, and copies the
Bravura font and the SoundFont into `static/font` and `static/soundfont` (generated, listed in `.gitignore`), which
SvelteKit serves at `/font/` and `/soundfont/`.


### Page (`src/routes/+page.svelte`)

alphaTab needs the DOM, Web Workers and Web Audio, so it is created in `onMount`, which runs only in the browser.
On the server the page renders the (disabled) button and an empty container; the function returned from `onMount`
destroys alphaTab when the page is left. Importing `@coderline/alphatab` on the server is safe: the module only
registers its worker and worklet factories when it is loaded.

- The API instance is a plain variable, not `$state`, so alphaTab's objects are not wrapped in reactive proxies.
  Only the UI state (player ready, playing) uses `$state`.
- `core.file`, `core.fontDirectory` and `player.soundFont` point to `/iron-waltz.gp`, `/font/` and
  `/soundfont/sonivox.sf2`. If the app is deployed under a `paths.base`, include it in these settings (e.g. with
  `asset()` from `$app/paths`).
- `@coderline/alphatab` is a runtime dependency: the Node server imports it when rendering the page.

## Notes

- `vite build` warns that alphaTab's core chunk is larger than 500 kB. That is expected: it is the whole alphaTab
  library (about 300 kB gzipped).
