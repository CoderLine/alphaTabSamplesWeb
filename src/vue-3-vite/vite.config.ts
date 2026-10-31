import { alphaTab } from '@coderline/alphatab-vite';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vue(), alphaTab()]
});
