# Next.js Example (Without WebPack Plugin)

Until we have official support for next.js the integration of alphaTab into next.js applications have to be in quite a old-fashioned way:

We include alphaTab as plain javascript asset file and let next.js load this file instead of using webpack dependency management. 
This way we can include alphaTab in a raw-fashion so that WebWorkers and AudioWorklets work. 

https://github.com/orgs/CoderLine/projects/12?pane=issue&itemId=65623529


## What's special in this project

### next.config.mjs

In there we setup the WebPack CopyPlugin to copy the alphaTab files:

* the UMD alphaTab.min.js for registering alphaTab as a global. 
* the font directory containing the music notation glyph font. 
* the soundfont directory containing the SF2 files for audio playback. 

Additionally we tell WebPack to "load" alphaTab from the global variable (e.g. globalThis.alphaTab).
This global variable will be added by adding a `script` tag for the plain `alphaTab.min.js`.

### src/alphaTab.ts

This file hides away the complexity of dynamically loading alphaTab and prevents that alphaTab is used directly and not via dynamically loaded script tag.

It uses the [`<Script />`](https://nextjs.org/docs/pages/api-reference/components/script) component to load alphaTab and provides a callback to when it is loaded.

### page.tsx

Here we use alphaTab through the specialized loader. 