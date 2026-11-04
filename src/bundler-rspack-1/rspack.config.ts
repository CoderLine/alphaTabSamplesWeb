import { defineConfig } from '@rspack/cli';
import { rspack, type SwcLoaderOptions } from '@rspack/core';
import { AlphaTabWebPackPlugin } from '@coderline/alphatab-webpack';

// Target browsers, see: https://github.com/browserslist/browserslist
const targets = ['last 2 versions', '> 0.2%', 'not dead', 'Firefox ESR'];

export default defineConfig({
  entry: {
    main: './src/index.ts',
  },
  output: {
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].js',
    assetModuleFilename: '[name].[contenthash][ext]',
    clean: true,
  },
  resolve: {
    extensions: ['...', '.ts'],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'builtin:swc-loader',
            options: {
              jsc: { parser: { syntax: 'ecmascript' } },
              env: { targets },
            } satisfies SwcLoaderOptions,
          },
        ],
      },
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'builtin:swc-loader',
            options: {
              jsc: { parser: { syntax: 'typescript' } },
              env: { targets },
            } satisfies SwcLoaderOptions,
          },
        ],
      },
    ],
  },
  plugins: [
    // Injects every entrypoint file, including the shared alphaTabCore chunk, into the page.
    new rspack.HtmlRspackPlugin({ template: './index.html' }),
    new AlphaTabWebPackPlugin(),
  ],
  performance: {
    // alphaTab's core chunk is about 1.2 MiB minified; fonts and SoundFont load on demand.
    maxEntrypointSize: 1.5 * 1024 * 1024,
    maxAssetSize: 1.5 * 1024 * 1024,
    assetFilter: (file: string) => file.endsWith('.js'),
  },
  devServer: {
    port: 4110,
  },
});
