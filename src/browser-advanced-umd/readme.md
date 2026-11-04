# alphaTab in the browser, advanced player UI (UMD script from a CDN)

A complete player UI on top of alphaTab, without any build step: track list with mute, solo and volume, play/pause,
stop, speed, count-in, metronome, looping, zoom, layout switch, print, Guitar Pro 7 export, a time slider and
drag & drop of score files. alphaTab is loaded with a classic `<script>` tag from jsDelivr (global `alphaTab`
variable) and used from [control.js](./control.js); Bootstrap 4, Font Awesome and Handlebars come from CDNs as well.

## Run

Serve this folder with any static web server (the score file does not load from `file://`), e.g. `npx serve .`,
and open the page.

## Notes

- The sample uses the `@alpha` tag to show unreleased features. In your projects, pin an exact version
  (e.g. `@coderline/alphatab@1.9.0`).
