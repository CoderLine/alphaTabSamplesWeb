const https = require('https');
const alphaTab = require('@coderline/alphatab');

// download test file
function loadFile(url) {
    return new Promise((resolve, reject) => {
        https.get(url, res => {
            res.setEncoding('binary');
            
            const data = [];
            
            res.on('data', chunk => {
                data.push(Buffer.from(chunk, 'binary'));
            }).on('end', () => {
                resolve(Buffer.concat(data));
            }).on('error', err => {
                reject(err);
            });
        });
    });
}

loadFile('https://www.alphatab.net/files/canon.gp').then(fileData => {
    const score = alphaTab.importer.ScoreLoader.loadScoreFromBytes(fileData);

    console.log(`Title: ${score.title}`);
    console.log(`Subtitle: ${score.subTitle}`);
    console.log(`Artist: ${score.artist}`);
    console.log(`Tempo: ${score.tempo}`);
    console.log(`Bars: ${score.masterBars.length}`);
    console.log(`Time Signature: ${score.masterBars[0].timeSignatureNumerator}/${score.masterBars[0].timeSignatureDenominator}`);
    // tracks
    console.log("Tracks: ");
    for (let i = 0; i < score.tracks.length; i++) {
        const track = score.tracks[i];
        const trackType = track.staves.find(s => s.isPercussion)
                ? "Percussion"
                : "Midi Instrument: " + track.playbackInfo.program;
        console.log(`   ${i + 1} - ${track.name} - ${trackType}`);
    }
});


