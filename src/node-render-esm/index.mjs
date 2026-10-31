import * as fs from 'node:fs';
import * as path from 'node:path';
import * as alphaTab from '@coderline/alphatab';
import * as alphaSkia from '@coderline/alphaskia';

const fileData = fs.readFileSync(new URL('./iron-waltz.gp', import.meta.url));

// enable alphaSkia for rendering PNGs
alphaTab.Environment.enableAlphaSkia(
    new Uint8Array(fs.readFileSync(new URL(import.meta.resolve('@coderline/alphatab/font/Bravura.otf')))).buffer,
    alphaSkia
);

const score = alphaTab.importer.ScoreLoader.loadScoreFromBytes(new Uint8Array(fileData));

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
            const imagePath = path.resolve('./iron-waltz.png');
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

// render the first track
renderer.renderScore(score, [0]);