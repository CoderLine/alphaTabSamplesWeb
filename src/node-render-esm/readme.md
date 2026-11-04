# alphaTab in Node.js: render a PNG

Loads a Guitar Pro file and renders the first track to `iron-waltz.png` with alphaTab's alphaSkia render engine.

```sh
npm install
npm start
```

Verified with Node.js 24 and alphaSkia 3.5 (`@coderline/alphaskia` installs the native package for the current
platform as an optional dependency).

## alphaTab setup

- `alphaTab.Environment.enableAlphaSkia(fontData, alphaSkia)` registers alphaSkia with the music font
  (`@coderline/alphatab/font/Bravura.otf`) before anything renders.
- `settings.core.engine = 'skia'` selects alphaSkia for the `ScoreRenderer`.
- The renderer reports the score in partial images (`partialRenderFinished`); the sample draws them onto one
  `AlphaSkiaCanvas` and encodes it as PNG. Each partial image is a native resource and is disposed after use.
