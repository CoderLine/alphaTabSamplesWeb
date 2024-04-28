<script setup lang="ts">
import {ref, onMounted, onUnmounted } from 'vue';
import { AlphaTabApi, Settings } from '@coderline/alphatab'

const element = ref(null);
const api = ref<AlphaTabApi|null>(null)

onMounted(()=>{
  api.value = new AlphaTabApi(element.value, {
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
})

onUnmounted(()=>{
  api.value?.destroy();
  api.value = null;
})

function playPause() {
  api.value?.playPause();
}
</script>

<template>
  <div>
      Hello AlphaTab!

      <button @click="playPause()">Play/Pause</button>
      <div ref="element"></div>
  </div>
</template>
