import * as alphaTab from '@coderline/alphatab';

const element = document.querySelector<HTMLDivElement>('#alphaTab')!;
const playPause = document.querySelector<HTMLButtonElement>('#play-pause')!;

const api = new alphaTab.AlphaTabApi(element, {
  core: {
    // The bundler emits the score as an asset and rewrites this URL.
    file: new URL('./iron-waltz.gp', import.meta.url).href,
    // Rsbuild emits scripts to static/js/; the plugin copies the font to <output>/font/.
    fontDirectory: '/font/',
  },
  player: {
    playerMode: alphaTab.PlayerMode.EnabledAutomatic,
    // Copied to <output>/soundfont/ by the alphaTab plugin.
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
