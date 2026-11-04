import * as alphaTab from '@coderline/alphatab';

const element = document.querySelector('#alphaTab');
const playPause = document.querySelector('#play-pause');

const api = new alphaTab.AlphaTabApi(element, {
    core: {
        // webpack emits the score as an asset and rewrites this URL.
        file: new URL('./iron-waltz.gp', import.meta.url).href
    },
    player: {
        playerMode: alphaTab.PlayerMode.EnabledAutomatic,
        // Copied to <output>/soundfont/ by the alphaTab plugin.
        soundFont: '/soundfont/sonivox.sf3'
    }
});

api.playerReady.on(() => {
    playPause.disabled = false;
});
api.playerStateChanged.on(e => {
    playPause.textContent = e.state === alphaTab.synth.PlayerState.Playing ? 'Pause' : 'Play';
});
playPause.addEventListener('click', () => api.playPause());
