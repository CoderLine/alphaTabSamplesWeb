import { defineConfig } from '@rsbuild/core';
import { AlphaTabWebPackPlugin } from '@coderline/alphatab-webpack';

export default defineConfig({
  html: {
    template: './index.html',
  },
  server: {
    port: 4130,
  },
  tools: {
    rspack: (_config, { appendPlugins }) => {
      appendPlugins(new AlphaTabWebPackPlugin());
    },
  },
});
