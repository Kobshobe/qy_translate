const path = require("path")
const webpack = require("webpack")
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
    plugins: [
        // 与 vue-cli 的 VUE_APP_* 注入保持一致（src/config.ts 的 platform）
        new webpack.DefinePlugin({
            "process.env.VUE_APP_STORE": JSON.stringify(process.env.VUE_APP_STORE || "")
        })
    ],
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            '@': resolve('src')
        }
    }
}