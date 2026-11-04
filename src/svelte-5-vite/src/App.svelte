<script lang="ts">
  import { AlphaTabApi, synth } from '@coderline/alphatab';
  import { onMount } from 'svelte';

  let element: HTMLDivElement;
  let api: AlphaTabApi | undefined;
  let playerReady = $state(false);
  let playing = $state(false);

  onMount(() => {
    // public/ holds the score; the alphaTab Vite plugin copies the font and SoundFont next to it.
    const instance = new AlphaTabApi(element, {
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
    instance.playerReady.on(() => (playerReady = true));
    instance.playerStateChanged.on((e) => (playing = e.state === synth.PlayerState.Playing));
    api = instance;
    return () => {
      instance.destroy();
      api = undefined;
    };
  });
</script>

<button type="button" disabled={!playerReady} onclick={() => api?.playPause()}>
  {playing ? 'Pause' : 'Play'}
</button>
<div bind:this={element}></div>
