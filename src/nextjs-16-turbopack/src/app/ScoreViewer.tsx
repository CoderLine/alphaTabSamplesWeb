'use client';

import * as alphaTab from '@coderline/alphatab';
import { useEffect, useRef, useState } from 'react';

// Next.js does not prefix URLs into public/ with basePath; next.config.ts exposes it for that.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH;

export function ScoreViewer() {
  const elementRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<alphaTab.AlphaTabApi | null>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [playing, setPlaying] = useState(false);

  // Client components are rendered on the server too; effects run only in the browser.
  useEffect(() => {
    const api = new alphaTab.AlphaTabApi(elementRef.current!, {
      core: {
        file: `${basePath}/iron-waltz.gp`,
        fontDirectory: `${basePath}/alphatab/font/`,
        // Turbopack does not bundle Audio Worklets; alphaTab loads its worklet from this copied entry.
        scriptFile: `${basePath}/alphatab/alphaTab.mjs`
      },
      player: {
        enablePlayer: true,
        enableCursor: true,
        soundFont: `${basePath}/alphatab/soundfont/sonivox.sf2`
      }
    });
    apiRef.current = api;
    api.playerReady.on(() => setPlayerReady(true));
    api.playerStateChanged.on(e => setPlaying(e.state === alphaTab.synth.PlayerState.Playing));

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
