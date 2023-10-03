const path = require("path")
const resolve = dir => path.resolve(__dirname, dir);

let mode = 'production'

if(process.env.NODE_ENV === 'development') {
    mode = 'development'
}

console.log(`building background.js for ${mode}`)


module.exports = {
    mode,
    devtool: 'inline-source-map',
    entry: {
        background: "./src/background/background.ts",
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