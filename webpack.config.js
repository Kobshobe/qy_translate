const path = require("path")
const resolve = dir => path.resolve(__dirname, dir);


module.exports = {
    mode: 'production',  // production development
    devtool: 'inline-source-map',
    entry: {
        background: "./src/plugins/background.ts",
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    },
    module: {
        rules: [
            { test: /\.ts$/, loader: "ts-loader" },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            '@': resolve('src')
        }
    }
}