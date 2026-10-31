<script setup lang="ts">
import { AlphaTabApi, synth } from '@coderline/alphatab';

const { app } = useRuntimeConfig();
const scoreElement = useTemplateRef<HTMLDivElement>('score');
// shallowRef: a deep reactive proxy around the API would wrap alphaTab's internal objects.
const api = shallowRef<AlphaTabApi>();
const playerReady = ref(false);
const playing = ref(false);

onMounted(async () => {
  // A .client component renders its template only after it is mounted.
  await nextTick();
  if (!scoreElement.value) {
    return;
  }
  // Served below the app base URL: the score from public/, font and SoundFont via nitro.publicAssets (nuxt.config.ts).
  const instance = new AlphaTabApi(scoreElement.value, {
    core: {
      file: `${app.baseURL}iron-waltz.gp`,
      fontDirectory: `${app.baseURL}font/`
    },
    player: {
      enablePlayer: true,
      enableCursor: true,
      soundFont: `${app.baseURL}soundfont/sonivox.sf2`
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
  <div>
    <button type="button" :disabled="!playerReady" @click="api?.playPause()">
      {{ playing ? 'Pause' : 'Play' }}
    </button>
    <div ref="score"></div>
  </div>
</template>
