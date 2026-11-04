import fs from 'node:fs';
import path from 'node:path';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import serve from 'rollup-plugin-serve';

const outdir = path.resolve(import.meta.dirname, 'dist');
const alphaTabDist = path.resolve(import.meta.dirname, 'node_modules/@coderline/alphatab/dist');
const watch = !!process.env.ROLLUP_WATCH;

/** Copies public/ and alphaTab's font and SoundFonts into the output folder. */
function copyAssets() {
  return {
    name: 'copy-assets',
    writeBundle() {
      fs.cpSync(path.resolve(import.meta.dirname, 'public'), outdir, { recursive: true });
      fs.cpSync(path.join(alphaTabDist, 'font'), path.join(outdir, 'font'), { recursive: true });
      fs.cpSync(path.join(alphaTabDist, 'soundfont'), path.join(outdir, 'soundfont'), { recursive: true });
    },
  };
}

/** @type {import('rollup').RollupOptions} */
export default {
  input: {
    main: 'src/main.js',
    'alphaTab.worker': 'src/alphaTab.worker.js',
    'alphaTab.worklet': 'src/alphaTab.worklet.js',
  },
  output: {
    dir: outdir,
    // ESM output: the shared alphaTab core chunk is imported by the page, the worker and the worklet.
    format: 'esm',
    // main.js references the worker and worklet by these names.
    entryFileNames: '[name].js',
    chunkFileNames: '[name]-[hash].js',
    sourcemap: watch,
  },
  plugins: [
    nodeResolve(),
    !watch && terser(),
    copyAssets(),
    watch && serve({ contentBase: outdir, host: 'localhost', port: 4185 }),
  ],
};
