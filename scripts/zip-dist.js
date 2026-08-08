/**
 * 打包 dist 为商店上传用的 zip：qy-{platform}-{version}.zip
 * - platform 取自 VUE_APP_STORE（与 src/config.ts 的 platform 同源），缺省 edge
 * - version 取自 src/background/manifest.json
 * - 商店要求 manifest.json 位于压缩包根目录，因此对 dist 目录内容打包
 * - 排除 .DS_Store 与 source map 文件
 */
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const platform = process.env.VUE_APP_STORE === 'chrome' ? 'chrome' : 'edge'
const { version } = require('../src/background/manifest.json')
const out = path.join(root, `qy-${platform}-${version}.zip`)
const dist = path.join(root, 'dist')

if (!fs.existsSync(path.join(dist, 'manifest.json'))) {
  console.error('错误：dist/ 不存在或不完整，请先执行构建')
  process.exit(1)
}

if (fs.existsSync(out)) fs.unlinkSync(out)

if (process.platform === 'win32') {
  execSync(
    `powershell -NoProfile -Command "Compress-Archive -Path '${dist.replace(/\\/g, '\\\\')}\\*' -DestinationPath '${out.replace(/\\/g, '\\\\')}' -Force"`,
    { cwd: root, stdio: 'inherit' }
  )
} else {
  execSync(`zip -ry "${out}" . -x "*.DS_Store" -x "*.map"`, {
    cwd: dist,
    stdio: 'inherit',
  })
}

console.log(`\n✅ 打包完成: ${path.relative(root, out)}`)
