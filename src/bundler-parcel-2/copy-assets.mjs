// Parcel has no step for copying static files: put alphaTab's font and SoundFonts into the output folder.
import fs from 'node:fs';
import path from 'node:path';

const alphaTabDist = path.resolve(import.meta.dirname, 'node_modules/@coderline/alphatab/dist');
const outdir = path.resolve(import.meta.dirname, 'dist');

for (const dir of ['font', 'soundfont']) {
  fs.cpSync(path.join(alphaTabDist, dir), path.join(outdir, dir), { recursive: true });
}
