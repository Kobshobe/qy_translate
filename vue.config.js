const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");


// 复制文件到指定目录
const copyFiles = [
  {
    from: path.resolve("src/plugins/manifest.json"),
    to: `${path.resolve("dist")}/manifest.json`
  },
  {
    from: path.resolve("src/assets"),
    to: path.resolve("dist/assets")
  },
  {
    from: path.resolve("src/components/translator/iframe.html"),
    to: path.resolve("dist")
  },
  {
    from: path.resolve("src/components/translator/iframe.js"),
    to: path.resolve("dist")
  },
  // {
  //   from: path.resolve("src/pdf_view/lib"),
  //   to: path.resolve("dist/lib")
  // },
];

// 复制插件
const plugins = [
  new CopyWebpackPlugin({
    patterns: copyFiles
  })
];

// 页面文件
const pages = {};
// 配置 popup.html 页面
const chromeName = ["popup", "options"];

chromeName.forEach(name => {
  pages[name] = {
    entry: `src/${name}/main.ts`,
    template: `src/${name}/index.html`,
    filename: `${name}.html`
  };
});

module.exports = {
  pages,
  productionSourceMap: false,
  // 配置 content.js background.js
  configureWebpack: {
    devtool: 'inline-source-map',
    entry: {
      content: "./src/content/main.ts",
    },
    output: {
      filename: "[name]-ewrskdfdswerhnyikyofd.js"
    },
    plugins
  },
  // 配置 content.css
  css: {
    extract: {
      filename: "css/[name]-ewrskdfdswerhnyikyofd.css",
      chunkFilename: "css/[name]-ewrskdfdswerhnyikyofd.css"
    }
  },
  chainWebpack: config => {
    /// 让打包时生成的 chunk-vendors.js 不带 hash
    // if (process.env.NODE_ENV === 'production') {
    // }
    config.output.filename('js/[name]-ewrskdfdswerhnyikyofd.js').end()
    config.output.chunkFilename('js/[name]-ewrskdfdswerhnyikyofd.js').end()
  }
}