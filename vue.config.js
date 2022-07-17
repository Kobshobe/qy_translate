const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");
const AutoImport = require('unplugin-auto-import/webpack')
const Components = require('unplugin-vue-components/webpack')
const { ElementPlusResolver } = require('unplugin-vue-components/resolvers')


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
  {
    from: path.resolve("src/pdf_viewer/build"),
    to: path.resolve("dist/pdf_viewer/build")
  },
  {
    from: path.resolve("src/pdf_viewer/web"),
    to: path.resolve("dist/pdf_viewer/web")
  },
  {
    from: path.resolve("src/_locales"),
    to: path.resolve("dist/_locales")
  },
];

// 插件
const plugins = [
  new CopyWebpackPlugin({
    patterns: copyFiles
  }),
  AutoImport({
    resolvers: [ElementPlusResolver()],
  }),
  Components({
    resolvers: [ElementPlusResolver()],
  }),
];

// 页面文件
const pages = {};
const chromeName = ["popup", "options"];

chromeName.forEach(name => {
  pages[name] = {
    entry: `src/${name}/main.ts`,
    template: `src/${name}/index.html`,
    filename: `${name}.html`
  };
});

pages["pdf_viewer"] = {
  entry: `src/pdf_viewer/web/main.ts`,
  template: `src/pdf_viewer/web/viewer.html`,
  filename: `pdf_viewer/web/index.html`
};

module.exports = {
  lintOnSave: false,
  pages,
  productionSourceMap: false,
  configureWebpack: {
    devtool: 'inline-source-map',
    entry: {
      content: "./src/content/main.ts"
    },
    output: {
      filename: "[name]-ewrskdfdswerhnyikyofd.js"
    },
    plugins
  },
  css: {
    extract: {
      filename: "css/[name]-ewrskdfdswerhnyikyofd.css",
      chunkFilename: "css/[name]-ewrskdfdswerhnyikyofd.css"
    }
  },
  chainWebpack: config => {
    config.output.filename('[name]-ewrskdfdswerhnyikyofd.js').end()
    config.output.chunkFilename('[name]-ewrskdfdswerhnyikyofd.js').end()
  }
}