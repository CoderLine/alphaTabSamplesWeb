import * as alphaTab from '@coderline/alphatab';

const element = document.querySelector<HTMLDivElement>('#alphaTab')!;
const playPause = document.querySelector<HTMLButtonElement>('#play-pause')!;

const api = new alphaTab.AlphaTabApi(element, {
  core: {
    // Vite emits the score as an asset and rewrites this URL.
    file: new URL('./iron-waltz.gp', import.meta.url).href,
    // Vite emits scripts to assets/; the plugin copies the font to <output>/font/.
    fontDirectory: `${import.meta.env.BASE_URL}font/`,
  },
  player: {
    playerMode: alphaTab.PlayerMode.EnabledAutomatic,
    // Copied to <output>/soundfont/ by the alphaTab plugin (via public/).
    soundFont: `${import.meta.env.BASE_URL}soundfont/sonivox.sf3`,
  },
});

api.playerReady.on(() => {
  playPause.disabled = false;
});
api.playerStateChanged.on((e) => {
  playPause.textContent = e.state === alphaTab.synth.PlayerState.Playing ? 'Pause' : 'Play';
});
playPause.addEventListener('click', () => api.playPause());
