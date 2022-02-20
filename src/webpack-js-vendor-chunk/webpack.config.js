const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {
    app: "./src/app.js",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    // Copy the Font and SoundFont Files to the output
    new CopyPlugin({
      patterns: [
        {
          from: "node_modules/@coderline/alphatab/dist/font/*.*",
          to: path.resolve(__dirname, "dist", "font", "[name][ext]"),
        },
        {
          from: "node_modules/@coderline/alphatab/dist/soundfont/*.*",
          to: path.resolve(__dirname, "dist", "soundfont", "[name][ext]"),
        },
      ],
    }),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all'
    },
  },
};
