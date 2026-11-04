<script lang="ts">
	import { AlphaTabApi, synth } from '@coderline/alphatab';
	import { onMount } from 'svelte';

	let element: HTMLDivElement;
	let api: AlphaTabApi | undefined;
	let playerReady = $state(false);
	let playing = $state(false);

	// onMount runs only in the browser, never during server-side rendering.
	onMount(() => {
		const instance = new AlphaTabApi(element, {
			core: {
				file: '/iron-waltz.gp',
				fontDirectory: '/font/'
			},
			player: {
				enablePlayer: true,
				enableCursor: true,
				soundFont: '/soundfont/sonivox.sf2'
			}
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

<svelte:head>
	<title>alphaTab + SvelteKit</title>
</svelte:head>

<button type="button" disabled={!playerReady} onclick={() => api?.playPause()}>
	{playing ? 'Pause' : 'Play'}
</button>
<div bind:this={element}></div>
