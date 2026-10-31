# alphaTab in the browser (ESM from a CDN)

Loads alphaTab as an ES module from jsDelivr without any build step, renders a Guitar Pro file and plays it back.

```js
import * as alphaTab from 'https://cdn.jsdelivr.net/npm/@coderline/alphatab@alpha/dist/alphaTab.min.mjs';
```

## Run

Serve this folder with any static web server (ES modules and the score file do not load from `file://`), e.g.
`npx serve .`, and open the page.

## Notes

- The sample uses the `@alpha` tag to show unreleased features. In your projects, pin an exact version
  (e.g. `@coderline/alphatab@1.9.0`) so a new release cannot change your page.
- alphaTab finds its font (`dist/font/`) next to the module on the CDN. The SoundFont URL is set explicitly.
- The browser does not allow a web worker from another origin, so alphaTab starts its worker through a small
  same-origin `blob:` module that imports the worker script from the CDN. The audio worklet loads from the CDN
  directly. Both need the CDN to send CORS headers, which jsDelivr does.
