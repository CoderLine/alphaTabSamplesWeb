import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as alphaTab from '@coderline/alphatab';
import * as alphaSkia from '@coderline/alphaskia';

// download test file
async function loadFile(url) {
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

const fileData = await loadFile('https://www.alphatab.net/files/canon.gp');

// enable alphaSkia for rendering PNGs
alphaTab.Environment.enableAlphaSkia(
    fs.readFileSync('./node_modules/@coderline/alphatab/dist/font/Bravura.ttf').buffer,
    alphaSkia
);

const score = alphaTab.importer.ScoreLoader.loadScoreFromBytes(fileData);

const settings = new alphaTab.Settings();
settings.core.engine = 'skia';
const renderer = new alphaTab.rendering.ScoreRenderer(settings);
renderer.width = 1200;

/**@type {alphaTab.rendering.RenderFinishedEventArgs[]} */
let images = [];
renderer.preRender.on(_ => {
    images = []; // clear on new rendering
});
renderer.partialLayoutFinished.on(r => {
    renderer.renderResult(r.id);
});
renderer.partialRenderFinished.on(r => {
    images.push(r);
});
renderer.renderFinished.on(r => {
    console.log(`Image rendered ${r.totalWidth}px * ${r.totalHeight}px`);

    // create full image with all chunks together
    const fullImageCanvas = new alphaSkia.AlphaSkiaCanvas();
    try {
        fullImageCanvas.beginRender(r.totalWidth, r.totalHeight);
        for (const img of images) {
            if(img.renderResult) {
                fullImageCanvas.drawImage(img.renderResult, img.x, img.y, img.width, img.height);
                img.renderResult[Symbol.dispose]();
            }
        }
        
        const fullImage = fullImageCanvas.endRender();
        try {
            const imagePath = path.resolve('./canon.png');
            fs.writeFileSync(imagePath, new Uint8Array(fullImage.toPng()));
            console.log('Saved image to ', imagePath)
        }
        finally {
            fullImage[Symbol.dispose]();
        }
    }
    catch(e) {
        console.error('Error saving', e);
    }
    finally {
        fullImageCanvas[Symbol.dispose]();
    }
});

// 3. Fire off rendering
renderer.renderScore(score, [0]);