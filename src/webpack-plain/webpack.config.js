const path = require("path");
const { AlphaTabWebPackPlugin } = require('@coderline/alphatab/webpack')

module.exports = {
    target: 'node',
    entry: {
        app: "./src/app.js",
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "dist"),
    },
    plugins: [
        new AlphaTabWebPackPlugin(),
    ]
};
