import { useEffect, useRef, useState } from 'react'
import './App.css'
import { AlphaTabApi, Settings } from '@coderline/alphatab'

function App() {
  const elementRef = useRef<HTMLDivElement>(null);
  const [api, setApi] = useState<AlphaTabApi>();

  useEffect(() => {
    const api = new AlphaTabApi(elementRef.current!, {
      core: {
        file: 'https://www.alphatab.net/files/canon.gp',
        fontDirectory: '/font/'
      },
      player: {
        enablePlayer: true,
        enableCursor: true,
        enableUserInteraction: true,
        soundFont: '/soundfont/sonivox.sf2'
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
      Hello AlphaTab!

      <button onClick={() => playPause()}>Play/Pause</button>
      <div ref={elementRef}></div>
    </>
  )
}

export default App
