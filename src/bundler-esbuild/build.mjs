import fs from 'node:fs';
import path from 'node:path';
import * as esbuild from 'esbuild';

const outdir = path.resolve(import.meta.dirname, 'dist');
const alphaTabDist = path.resolve(import.meta.dirname, 'node_modules/@coderline/alphatab/dist');
const serve = process.argv.includes('--serve');

fs.rmSync(outdir, { recursive: true, force: true });
fs.cpSync(path.resolve(import.meta.dirname, 'public'), outdir, { recursive: true });
fs.cpSync(path.join(alphaTabDist, 'font'), path.join(outdir, 'font'), { recursive: true });
fs.cpSync(path.join(alphaTabDist, 'soundfont'), path.join(outdir, 'soundfont'), { recursive: true });

/** @type {esbuild.BuildOptions} */
const options = {
  entryPoints: ['src/main.ts', 'src/alphaTab.worker.ts', 'src/alphaTab.worklet.ts'],
  bundle: true,
  // One shared chunk with alphaTab's core, imported by the page, the worker and the worklet.
  splitting: true,
  format: 'esm',
  outdir,
  // main.ts references the worker and worklet by these names.
  entryNames: '[name]',
  chunkNames: '[name]-[hash]',
  minify: !serve,
  sourcemap: serve,
  target: 'es2022',
  logLevel: 'info',
};

if (serve) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
  await ctx.serve({ servedir: outdir, port: 4170 });
} else {
  await esbuild.build(options);
}
