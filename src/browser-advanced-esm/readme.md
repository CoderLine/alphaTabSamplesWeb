# alphaTab in the browser, advanced player UI (ESM from a CDN)

A complete player UI on top of alphaTab, without any build step: track list with mute, solo and volume, play/pause,
stop, speed, count-in, metronome, looping, zoom, layout switch, print, Guitar Pro 7 export, a time slider and
drag & drop of score files. alphaTab is imported as an ES module from jsDelivr in [control.mjs](./control.mjs);
Bootstrap 4, Font Awesome and Handlebars come from CDNs as well.

## Run

Serve this folder with any static web server (ES modules and the score file do not load from `file://`), e.g.
`npx serve .`, and open the page.

## Notes

- The sample uses the `@alpha` tag to show unreleased features. In your projects, pin an exact version
  (e.g. `@coderline/alphatab@1.9.0`).
- See [browser-simple-esm](../browser-simple-esm/) for how the worker and worklet load from the CDN.
