import { AlphaTabApi, synth } from '@coderline/alphatab';
import { useEffect, useRef, useState } from 'react';

export function App() {
  const elementRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<AlphaTabApi | null>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    // Served from public/ below the app base; font/ and soundfont/ are copied there by the alphaTab Vite plugin.
    const api = new AlphaTabApi(elementRef.current!, {
      core: {
        file: `${import.meta.env.BASE_URL}iron-waltz.gp`,
        fontDirectory: `${import.meta.env.BASE_URL}font/`
      },
      player: {
        enablePlayer: true,
        enableCursor: true,
        soundFont: `${import.meta.env.BASE_URL}soundfont/sonivox.sf2`
      }
    });
    apiRef.current = api;
    api.playerReady.on(() => setPlayerReady(true));
    api.playerStateChanged.on(e => setPlaying(e.state === synth.PlayerState.Playing));

    return () => {
      api.destroy();
      apiRef.current = null;
      setPlayerReady(false);
      setPlaying(false);
    };
  }, []);

  return (
    <>
      <button type="button" disabled={!playerReady} onClick={() => apiRef.current?.playPause()}>
        {playing ? 'Pause' : 'Play'}
      </button>
      <div ref={elementRef} />
    </>
  );
}
