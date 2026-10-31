# alphaTab with React 19 and Vite

Loads and renders "Iron Waltz" (`public/iron-waltz.gp`, a Guitar Pro file of alphaTab's own demo song) and plays it back from a React component, bundled with Vite and the alphaTab Vite plugin.

| Package | Version |
| --- | --- |
| React | 19 |
| Vite | 8 (`@vitejs/plugin-react` 6) |
| `@coderline/alphatab`, `@coderline/alphatab-vite` | 1.9 |

## Run

```bash
npm install
npm run dev       # dev server
npm run build     # type-check and production build into dist/
npm run preview   # serve dist/
```

## alphaTab setup

### `vite.config.ts`

```ts
import { alphaTab } from '@coderline/alphatab-vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), alphaTab()]
});
```

The plugin

- bundles alphaTab's render/synth web worker and its audio worklet as chunks of the main build. Page, workers and worklet share one `alphaTab.core-*.js` chunk, so alphaTab's code is downloaded once;
- excludes alphaTab from Vite's dependency pre-bundling in dev, so the dev server serves the worker and worklet entries as they are;
- copies the Bravura font and the SoundFont into Vite's `publicDir` (`public/font`, `public/soundfont`) when the dev server or a build starts. These folders are generated and listed in `.gitignore`.

### Component (`src/App.tsx`)

- alphaTab needs a DOM element. It is created in `useEffect` with the element from `useRef`, and destroyed in the effect cleanup with `api.destroy()`. In dev, `StrictMode` mounts the effect twice; the cleanup makes the second instance the only one (you will see the extra workers of the first instance being started and terminated in the network tab).
- The `AlphaTabApi` is kept in a ref, not in state: it is a mutable object and its changes must not re-render the component. Only the UI state (player ready, playing) lives in React state, updated from `playerReady` and `playerStateChanged`.
- `core.file` points to the score in `public/`, `core.fontDirectory` and `player.soundFont` to the copied assets, all prefixed with `import.meta.env.BASE_URL` so they still resolve when the app is deployed with a [`base`](https://vite.dev/config/shared-options.html#base). alphaTab cannot derive these paths itself, because the bundled script lives in `assets/`, not next to the fonts.

## React 18

The same code works unchanged with React 18.3 (`react@^18.3.1`, `react-dom@^18.3.1`, `@types/react@^18.3`, `@types/react-dom@^18.3`); this was verified with this sample. React 18 is no longer developed further, so this sample targets React 19.

## Notes

- `vite build` warns that `alphaTab.core-*.js` is larger than 500 kB. That is expected: it is the whole alphaTab library (about 300 kB gzipped). Raise `build.chunkSizeWarningLimit` if the warning bothers you.
- alphaTab is browser-only. For server-side rendering see the Next.js samples.
