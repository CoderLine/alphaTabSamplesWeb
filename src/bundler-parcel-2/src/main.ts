// `@coderline/alphatab/core` does not start workers on its own: the app tells alphaTab how to create them.
import * as alphaTab from '@coderline/alphatab/core';
import workletUrl from 'worklet:./alphaTab.worklet.ts';

alphaTab.Environment.initializeMain(
  (_settings, nameHint) =>
    new Worker(new URL('./alphaTab.worker.ts', import.meta.url), { type: 'module', name: nameHint }),
  (context) => context.audioWorklet.addModule(workletUrl),
);

const element = document.querySelector<HTMLDivElement>('#alphaTab')!;
const playPause = document.querySelector<HTMLButtonElement>('#play-pause')!;

const api = new alphaTab.AlphaTabApi(element, {
  core: {
    file: new URL('./iron-waltz.gp', import.meta.url).href,
    // Copied to <output>/font/ and <output>/soundfont/ by copy-assets.mjs.
    fontDirectory: '/font/',
  },
  player: {
    playerMode: alphaTab.PlayerMode.EnabledAutomatic,
    soundFont: '/soundfont/sonivox.sf3',
  },
});

api.playerReady.on(() => {
  playPause.disabled = false;
});
api.playerStateChanged.on((e) => {
  playPause.textContent = e.state === alphaTab.synth.PlayerState.Playing ? 'Pause' : 'Play';
});
playPause.addEventListener('click', () => api.playPause());
