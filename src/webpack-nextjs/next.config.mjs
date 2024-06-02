import CopyPlugin from "copy-webpack-plugin";
import url from "url";
import path from "path";

const dirName = url.fileURLToPath(new URL(".", import.meta.url));

const publicPath = path.join(dirName, 'public');
const alphaTabAssetPath = path.join(dirName, 'node_modules', '@coderline', 'alphatab', 'dist');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.plugins.push(
      new CopyPlugin({
        patterns: [
          {
            from: path.join(alphaTabAssetPath, "font"),
            to: path.join(publicPath, 'alphatab', "font"),
          },
          {
            from: path.join(alphaTabAssetPath, "soundfont"),
            to: path.join(publicPath, 'alphatab', "soundfont"),
          },
          {
            from: path.join(alphaTabAssetPath, "alphaTab.min.js"),
            to: path.join(publicPath, 'alphatab'),
          }
        ],
      })
    );

    config.externals = [
      function ({ request }, callback) {
        if (request === '@coderline/alphatab') {
          return callback(null, 'alphaTab', 'global')
        }

        return callback();
      },
    ];
    
    return config;
  },
};

export default nextConfig;
