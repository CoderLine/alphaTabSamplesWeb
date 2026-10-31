# alphaTab in Node.js (ESM)

Loads a Guitar Pro file with alphaTab in Node.js and prints the song information and tracks. Uses
`import * as alphaTab from '@coderline/alphatab'`, which resolves to alphaTab's ES module build.

```sh
npm install
npm start
```

Verified with Node.js 24. alphaTab's importers and exporters work in Node.js; rendering to images needs alphaSkia (see
[node-render-esm](../node-render-esm/)). Workers and audio playback are browser-only.
