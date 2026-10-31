<script setup lang="ts">
import { AlphaTabApi, synth } from '@coderline/alphatab';
import { onMounted, onUnmounted, ref, shallowRef, useTemplateRef } from 'vue';

const scoreElement = useTemplateRef<HTMLDivElement>('score');
// shallowRef: a deep reactive proxy around the API would wrap alphaTab's internal objects.
const api = shallowRef<AlphaTabApi>();
const playerReady = ref(false);
const playing = ref(false);

onMounted(() => {
  // Served from public/ below the app base; font/ and soundfont/ are copied there by the alphaTab Vite plugin.
  const instance = new AlphaTabApi(scoreElement.value!, {
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
  instance.playerReady.on(() => (playerReady.value = true));
  instance.playerStateChanged.on(e => (playing.value = e.state === synth.PlayerState.Playing));
  api.value = instance;
});

onUnmounted(() => {
  api.value?.destroy();
  api.value = undefined;
});
</script>

<template>
  <button type="button" :disabled="!playerReady" @click="api?.playPause()">
    {{ playing ? 'Pause' : 'Play' }}
  </button>
  <div ref="score"></div>
</template>
