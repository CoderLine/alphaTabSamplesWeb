import { AlphaTabApi, synth } from '@coderline/alphatab';
import { createSignal, onCleanup, onMount } from 'solid-js';

export default function App() {
  let element!: HTMLDivElement;
  let api: AlphaTabApi | undefined;
  const [playerReady, setPlayerReady] = createSignal(false);
  const [playing, setPlaying] = createSignal(false);

  onMount(() => {
    // public/ holds the score; the alphaTab Vite plugin copies the font and SoundFont next to it.
    api = new AlphaTabApi(element, {
      core: {
        file: `${import.meta.env.BASE_URL}iron-waltz.gp`,
        fontDirectory: `${import.meta.env.BASE_URL}font/`,
      },
      player: {
        enablePlayer: true,
        enableCursor: true,
        soundFont: `${import.meta.env.BASE_URL}soundfont/sonivox.sf2`,
      },
    });
    api.playerReady.on(() => setPlayerReady(true));
    api.playerStateChanged.on((e) => setPlaying(e.state === synth.PlayerState.Playing));
  });

  onCleanup(() => {
    api?.destroy();
    api = undefined;
  });

  return (
    <>
      <button type="button" disabled={!playerReady()} onClick={() => api?.playPause()}>
        {playing() ? 'Pause' : 'Play'}
      </button>
      <div ref={element}></div>
    </>
  );
}
