import * as fs from 'node:fs';
import * as alphaTab from '@coderline/alphatab';

const fileData = fs.readFileSync(new URL('./iron-waltz.gp', import.meta.url));
const score = alphaTab.importer.ScoreLoader.loadScoreFromBytes(new Uint8Array(fileData));

console.log(`Title: ${score.title}`);
console.log(`Subtitle: ${score.subTitle}`);
console.log(`Artist: ${score.artist}`);
console.log(`Tempo: ${score.tempo}`);
console.log(`Bars: ${score.masterBars.length}`);
console.log(`Time Signature: ${score.masterBars[0].timeSignatureNumerator}/${score.masterBars[0].timeSignatureDenominator}`);
console.log('Tracks:');
for (let i = 0; i < score.tracks.length; i++) {
    const track = score.tracks[i];
    const trackType = track.staves.find(s => s.isPercussion)
        ? 'Percussion'
        : `Midi Instrument: ${track.playbackInfo.program}`;
    console.log(`   ${i + 1} - ${track.name} - ${trackType}`);
}
