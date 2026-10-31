'use client';

import { AlphaTabApi, synth } from '@coderline/alphatab';
import { useEffect, useRef, useState } from 'react';

export function ScoreViewer() {
  const elementRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<AlphaTabApi | null>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [playing, setPlaying] = useState(false);

  // Client components are rendered on the server too; effects run only in the browser.
  useEffect(() => {
    const api = new AlphaTabApi(elementRef.current!, {
      core: {
        file: '/iron-waltz.gp',
        fontDirectory: '/alphatab/font/'
      },
      player: {
        enablePlayer: true,
        enableCursor: true,
        soundFont: '/alphatab/soundfont/sonivox.sf2'
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
