# alphaTab in Node.js (CommonJS)

Loads a Guitar Pro file with alphaTab in Node.js and prints the song information and tracks. Uses
`require('@coderline/alphatab')`, which resolves to alphaTab's UMD build.

```sh
npm install
npm start
```

Verified with Node.js 24. alphaTab's importers and exporters work in Node.js; rendering to images needs alphaSkia (see
[node-render-esm](../node-render-esm/)). Workers and audio playback are browser-only.
