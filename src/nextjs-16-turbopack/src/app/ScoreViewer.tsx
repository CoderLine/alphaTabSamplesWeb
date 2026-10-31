'use client';

import * as alphaTab from '@coderline/alphatab/core';
import { useEffect, useRef, useState } from 'react';

function initializeAlphaTab() {
  alphaTab.Environment.initializeMain(
    // Turbopack bundles workers created in this form; the worker shares alphaTab's core chunk with the page.
    (_settings, name) => new Worker(new URL('./alphaTab.worker.ts', import.meta.url), { type: 'module', name }),
    // Turbopack cannot bundle worklets: the worklet loads the unbundled entry copied to public/.
    context => context.audioWorklet.addModule('/alphatab/alphaTab.worklet.mjs')
  );
}

export function ScoreViewer() {
  const elementRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<alphaTab.AlphaTabApi | null>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [playing, setPlaying] = useState(false);

  // Client components are rendered on the server too; effects run only in the browser.
  useEffect(() => {
    initializeAlphaTab();
    const api = new alphaTab.AlphaTabApi(elementRef.current!, {
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
