---
name: qy-translate-test
description: Testing workflows for the QY Translate Chrome extension project
---

# QY Translate Testing

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

> `<EXTENSION_ID>` 从 `chrome://extensions/` 获取
