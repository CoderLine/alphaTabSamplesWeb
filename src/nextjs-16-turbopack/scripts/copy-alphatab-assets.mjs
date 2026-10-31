// Copies what alphaTab loads at runtime but Turbopack cannot bundle into public/alphatab/:
// the font, the SoundFont, and the audio worklet entry with the alphaTab core it imports.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = path.dirname(fileURLToPath(import.meta.resolve('@coderline/alphatab')));
const target = path.resolve('public/alphatab');

fs.rmSync(target, { recursive: true, force: true });
fs.mkdirSync(target, { recursive: true });
for (const entry of ['font', 'soundfont', 'alphaTab.worklet.mjs', 'alphaTab.core.mjs']) {
  fs.cpSync(path.join(dist, entry), path.join(target, entry), { recursive: true });
}
