import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { alphaTab } from "@coderline/alphatab/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), alphaTab()]
});
