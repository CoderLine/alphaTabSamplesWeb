# alphaTab in the browser (UMD script from a CDN)

Loads alphaTab with a classic `<script>` tag from jsDelivr (global `alphaTab` variable), renders a Guitar Pro file
and plays it back.

```html
<script src="https://cdn.jsdelivr.net/npm/@coderline/alphatab@alpha/dist/alphaTab.min.js"></script>
```

## Run

Serve this folder with any static web server (the score file does not load from `file://`), e.g. `npx serve .`,
and open the page.

## Notes

- The sample uses the `@alpha` tag to show unreleased features. In your projects, pin an exact version
  (e.g. `@coderline/alphatab@1.9.0`) so a new release cannot change your page.
- alphaTab finds its font (`dist/font/`) next to the script on the CDN. The SoundFont URL is set explicitly.
- The same `alphaTab.min.js` file runs in the page, in the web worker (started through a same-origin `blob:` script
  calling `importScripts`) and in the audio worklet.
