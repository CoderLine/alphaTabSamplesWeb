"use client"

import { useEffect, useRef, useState } from "react";
import { AlphaTab, AlphaTabApi, Settings, AlphaTabLoader } from "./alphatab";

export default function Home() {
  const elementRef = useRef<HTMLDivElement>(null);
  const [alphaTab, setAlphaTab] = useState<AlphaTab>();
  const [api, setApi] = useState<AlphaTabApi>();

  useEffect(() => {
    if(!alphaTab) {
      return;
    }

    const api = new alphaTab.AlphaTabApi(elementRef.current!, {
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
  }, [alphaTab]);

  function playPause() {
    api?.playPause();
  }
  
  return (
    <>
      <main>
        <AlphaTabLoader onLoad={setAlphaTab} />
        <button onClick={() => playPause()}>Play/Pause</button>
        <div ref={elementRef}></div>
      </main>
    </>
  );
}
