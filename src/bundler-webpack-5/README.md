# alphaTab with webpack 5

A plain webpack 5 browser app (no framework) that renders a Guitar Pro file and plays it back.
It uses [`@coderline/alphatab-webpack`](https://www.npmjs.com/package/@coderline/alphatab-webpack) so that
alphaTab's render worker and audio worklet are bundled correctly and share one alphaTab core chunk with the page.

Versions: webpack 5.112, webpack-cli 7, webpack-dev-server 6, html-webpack-plugin 5, alphaTab 1.9.
Also verified with webpack 5.90.

## Run

```sh
npm install
npm run dev      # webpack-dev-server on http://localhost:4100
npm run build    # production build into dist/
npm run preview  # serves dist/ on http://localhost:4100
```

## alphaTab setup

[webpack.config.js](./webpack.config.js):

```js
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { AlphaTabWebPackPlugin } from '@coderline/alphatab-webpack';

export default {
    // ...
    plugins: [
        new HtmlWebpackPlugin({ template: './src/index.html' }),
        new AlphaTabWebPackPlugin()
    ]
};
```

What the plugin does:

- Bundles alphaTab's web worker (`new Worker(new URL(...))`) and audio worklet (`alphaTabWorklet.addModule(new URL(...))`)
  as separate entries. webpack has no built-in audio worklet support that works with `[contenthash]` file names.
- Moves alphaTab's core into one `alphaTabCore` split chunk that the page, the workers and the worklet load, instead of
  one copy per runtime. For that it sets `optimization.usedExports = 'global'` in production builds when you did not
  configure it (it warns if you set it to `true`, which would duplicate the core).
- Copies the Bravura font to `dist/font/` and the SoundFonts to `dist/soundfont/`, and serves them in the dev server.

Because the core is a split chunk of the entrypoint, the HTML must load every file of the entrypoint.
`HtmlWebpackPlugin` does this. If you write the `<script>` tags yourself, include all files listed for the entrypoint in
webpack's stats/manifest, not only `main.js`.

The app code ([src/index.js](./src/index.js)) uses the normal `@coderline/alphatab` import. The SoundFont URL points to
the copy made by the plugin; the font is found automatically next to the scripts:

```js
const api = new alphaTab.AlphaTabApi(element, {
    core: { file: new URL('./iron-waltz.gp', import.meta.url).href },
    player: {
        playerMode: alphaTab.PlayerMode.EnabledAutomatic,
        soundFont: '/soundfont/sonivox.sf3'
    }
});
```

Further settings in the config:

- `optimization.runtimeChunk: 'single'` follows webpack's own recommendation; it works with the plugin (workers and
  worklet keep their own runtime).
- `performance`: alphaTab's core chunk is about 1.2 MiB minified, above webpack's 244 KiB default budget. The sample
  raises the budget for JavaScript and excludes fonts and SoundFonts, which load on demand.

## Notes

- Opting out of the shared core: `optimization.splitChunks.cacheGroups.alphaTabCore = false`. The page and the
  workers then each include a copy of the core (needed only for hosts whose HTML generation does not load all
  entrypoint files). `optimization.splitChunks: false` has the same effect.
- Do not rely on webpack's native audio worklet support (webpack 5.112); it breaks with `[contenthash]` output names.
  The plugin handles the worklet.
