---
name: qy-translate-test
description: Testing workflows for the QY Translate Chrome extension project
---

# QY Translate Testing

> 本项目的扩展 ID 通常是 `bheljikejpfmilhpgcaookhkbefgcfog`，可通过 `chrome://extensions/` 确认。

## 加载扩展

```bash
# 1. 先构建
cd /Users/kobs/code/web/qy_translate && npx vue-cli-service build

# 2. 打开 Chrome 扩展管理页
playwright-cli open "chrome://extensions/" --headed --persistent --browser=chrome

# 3. 点击"加载未打包的扩展程序"，输入 dist 路径
playwright-cli click "加载未打包的扩展程序"
playwright-cli run-code "
async (page) => {
  await page.keyboard.insertText('/Users/kobs/code/web/qy_translate/dist');
  await page.keyboard.press('Enter');
}
"

# 4. 确认扩展已加载（快照中应出现"轻氧翻译"）
playwright-cli snapshot
```

## 添加大模型配置

```bash
# 1. 打开大模型设置页
playwright-cli goto "chrome-extension://bheljikejpfmilhpgcaookhkbefgcfog/options.html#/llm"

# 2. 点击"+ 添加大模型"
playwright-cli click "+ 添加大模型"

# 3. 选择预设（如 deepseek）
playwright-cli click "deepseek deepseek"

# 4. 填写 API Key
playwright-cli fill "请输入 API Key" "sk-test123456789"

# 5. 保存
playwright-cli click "保存"

# 6. 确认卡片出现
playwright-cli snapshot
```

## 测试弹窗翻译引擎选择器显示大模型

```bash
# 1. 打开弹窗
playwright-cli goto "chrome-extension://bheljikejpfmilhpgcaookhkbefgcfog/popup.html"

# 2. 输入文本并翻译
playwright-cli fill "请输入文本内容" "Hello world"
playwright-cli click "div.editing-tool-bar-right .icon-btn-main"

# 3. 点击右下角翻译引擎图标打开选项面板（第二个 .tool-bar-right 内的图标）
playwright-cli click "div.tool-bar-right .icon-btn-main >> nth=1"

# 4. 点击引擎选择器展开下拉
playwright-cli click "getByPlaceholder('请选择').nth(2)"

# 5. 检查快照，应包含"大模型"分组及已配置的模型名称
playwright-cli snapshot --depth=30
```

期望结果：引擎下拉中「大模型」分组下应显示已配置的模型（如 Deepseek）。

## 测试收藏页面选词翻译

```bash
# 1. 打开收藏页面
playwright-cli goto "chrome-extension://<EXTENSION_ID>/options.html#/collections"

# 2. 选中收藏短语中的文本
playwright-cli eval "(function(){
  var el = document.querySelector('[class*=phrase]') || document.body;
  var r = document.createRange();
  r.selectNodeContents(el);
  var s = window.getSelection();
  s.removeAllRanges();
  s.addRange(r);
  var e = new MouseEvent('mouseup', {clientX: 200, clientY: 200, bubbles: true});
  document.dispatchEvent(e);
  return s.toString().substring(0, 20);
})()"

# 3. 点击浮出的翻译按钮
playwright-cli click ".tap-to-translate"

# 4. 查看翻译结果
playwright-cli snapshot
```
