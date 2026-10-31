const { AlphaTabWebPackPlugin } = require('@coderline/alphatab-webpack');

/** @type {import('webpack').Configuration} */
module.exports = {
  plugins: [new AlphaTabWebPackPlugin()],
  optimization: {
    splitChunks: {
      cacheGroups: {
        alphaTabCore: false,
      },
    },
  },
};
