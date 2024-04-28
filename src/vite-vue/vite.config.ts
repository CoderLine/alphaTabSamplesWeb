import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { alphaTab } from "@coderline/alphatab/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), alphaTab()],
});
