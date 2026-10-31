import path from 'node:path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { AlphaTabWebPackPlugin } from '@coderline/alphatab-webpack';

/** @type {import('webpack').Configuration} */
export default {
    entry: './src/index.js',
    output: {
        path: path.resolve(import.meta.dirname, 'dist'),
        filename: '[name].[contenthash].js',
        chunkFilename: '[name].[contenthash].js',
        assetModuleFilename: '[name].[contenthash][ext]',
        clean: true
    },
    plugins: [
        // Injects every entrypoint file, including the shared alphaTabCore chunk, into the page.
        new HtmlWebpackPlugin({ template: './src/index.html' }),
        new AlphaTabWebPackPlugin()
    ],
    optimization: {
        runtimeChunk: 'single'
    },
    performance: {
        // alphaTab's core chunk is about 1.2 MiB minified; fonts and SoundFont load on demand.
        maxEntrypointSize: 1.5 * 1024 * 1024,
        maxAssetSize: 1.5 * 1024 * 1024,
        assetFilter: file => file.endsWith('.js')
    },
    devServer: {
        port: 4100
    }
};
