"use client"

import { useEffect, useRef, useState } from "react";
import { AlphaTabApi, Settings } from "@coderline/alphatab";

export default function Home() {
  const elementRef = useRef<HTMLDivElement>(null);
  const [api, setApi] = useState<AlphaTabApi>();

  useEffect(() => {
    const api = new AlphaTabApi(elementRef.current!, {
      core: {
        file: 'https://www.alphatab.net/files/canon.gp',
        fontDirectory: '/alphatab/font/'
      },
      player: {
        enablePlayer: true,
        enableCursor: true,
        enableUserInteraction: true,
        soundFont: '/alphatab/soundfont/sonivox.sf2'
      }
    } as Settings);
    
    setApi(api);

    return () => {
      console.log('destroy', elementRef, api);
      api.destroy();
    }
  }, []);

  function playPause() {
    api?.playPause();
  }
  
  return (
    <>
      <main>
        <button onClick={() => playPause()}>Play/Pause</button>
        <div ref={elementRef}></div>
      </main>
    </>
  );
}
