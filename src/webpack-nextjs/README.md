# Next.js Example

This sample shows how to use alphaTab with next.js.

In the `next.config.mjs` we register the alphaTab webpack plugin taking care of the bundling specific points. 

## Starting

```bash
npm i
npm run dev
```

## Whats Special 

* In `next.config.mjs` configure the `AlphaTabWebPackPlugin` to copy the assets to `public/alphatab` via `assetOutputDir`. This is because of some known issue that in next.js assets are not served in "dev" mode. See https://github.com/vercel/next.js/issues/45478 and https://github.com/orgs/vercel/discussions/5182.
* In `page.tsx` you find the code to initialize alphaTab. There you will also see that we
    * Set the `fontDirectory` and `soundFont` paths to point to the assets we copy. 
* Do NOT use the new Turbopack bundler they built for Next.js They do not offer a plugin system and their built-in systems do not support WebWorkers & Audio Worklets like we need it. 