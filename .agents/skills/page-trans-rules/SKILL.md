---
name: page-trans-rules
description: 修改网页翻译筛选规则时的注意事项与验证流程。当要改动网页翻译的提取/筛选逻辑（ruleFilter、TARGET_TAGS、容器发现、可见性判定、文本判定、siteRules 等）时使用本 skill。
---

# 网页翻译筛选规则 — 修改注意事项

> 适用场景：修改 `src/content/pageTrans/` 下的提取/筛选规则。
> 核心原则（强约束）：**改动必须通用**（针对 HTML 标准语义或某一类网站结构，而非单个网站 hack）；
> **如果改动可能带来不确定的风险，或不够通用，则放弃修改**，改为记录问题、等待讨论后再决定。

## 代码位置

| 文件 | 职责 |
|---|---|
| `src/content/pageTrans/ruleFilter.ts` | **规则本体**（纯函数、可插桩）：`TARGET_TAGS` / `SKIP_TAGS` / `SKIP_ROLES` / `NON_CONTENT_SELECTOR` / 长度阈值 / `filterParagraphs()` / `isInNonContentArea()` / `isInsideHorizScrollable()` / `isElementVisible()` / `shouldTranslateText()` |
| `src/content/pageTrans/pageTransEngine.ts` | 引擎，**消费** ruleFilter（通用提取路径委托给它），另有翻译管线/渲染/动态观察 |
| `src/content/pageTrans/siteRules.ts` | 站点专用规则（GitHub/Wikipedia/YouTube/Reddit/X），**当前约定：暂不处理** |
| `src/options/views/RuleLab.vue` | Rule Lab 测试页（固定 Vue 页面 = 翻译对象，加载即自动跑规则，绿=提取/红=过滤/原因统计/节点详情） |

## 验证流程（改完规则必须全走一遍）

1. **Rule Lab 可视化验证**（主要手段）：
   - `pnpm build` 后打开 `chrome-extension://<id>/options.html?mode=debug#/rule-lab`
   - 固定页面覆盖：文章/表格/代码块/混合语言/卡片/FAQ 折叠/导航/侧边栏/页脚/边缘场景（隐藏、短文本、数字、URL、长文本、role 排除）
   - 绿框 = 提取、红框 = 过滤；统计栏按原因分组；点节点看判定依据。
   - 切换目标语言（auto ↔ zh-CN 等）验证 `isTargetLangText` 行为。
2. **真实页面验证**（推荐）：
   - 打开 `chrome://extensions/`，**只重载"轻氧翻译"扩展的"重新加载"按钮**（页面上可能有多个扩展，如沉浸式翻译，别点错！）。
   - 重载后**已打开的页面必须刷新**才会注入新的 content script。
   - 页面翻译需手动触发：点击悬浮球（`.qyt-fb-ball`）。playwright 的 CDP 键盘事件触发不了浏览器级快捷键（如 Alt+A）。
   - 遇到可疑页面（某文本没翻译），用 playwright 检查该文本的 DOM 结构（标签、祖先链、是否在 main 内、有无 `data-qyt-processed`）定位原因。

## 规则语义速查

- `TARGET_TAGS`：候选标签集合 = `p, h1–h6, li, td, th, blockquote, figcaption, dt, dd, caption, summary, a`（`summary` 是 2026-08 加的：FAQ 折叠标题，trustlinq.com 案例）。
- `SKIP_TAGS` / `SKIP_ROLES`：`script/style/code/pre/svg/…`、`navigation/dialog/toolbar/…`。
- `MIN_TEXT_LENGTH=2` / `MAX_TEXT_LENGTH=5000`；裸文本 `<div>` 候选阈值 `MIN_DIV_TEXT_LENGTH=30`（无子元素）。
- **裸 div 去重**（2026-08 加）：① 嵌在 TARGET_TAGS（td/li/blockquote…）内的裸 div 不提取（`duplicate-of-ancestor`），由祖先整块翻译；② 链接区块（子元素全为 `<a>` 的裸 div）由 div 整块翻译，内部 `<a>` 去重——已 processed 的 div 在动态路径同样参与去重（否则二次提取会漏网，MDN footer 实例）。
- **提取范围 = 全页扫描**（2026-08-14 起，`extract()` 直接 `filterParagraphs(document.body)`，无主容器限定/覆盖率回退——旧版的 `findMainContentContainer` 语义容器发现与覆盖率回退判定已删除；pageTransEngine.ts 仅剩动态观察）。
- `isInNonContentArea`：① 选择器（nav/header/footer/aside/`.sidebar`/role 等）② 链接密度启发式（链接占比 >50% 且平均 <25 字符且最大 <20）。
- `isElementVisible`：**无条件检查** `display: none` / `visibility: hidden` / `opacity < 0.01`（`visibility:hidden`/`opacity:0` 仍占布局、offsetParent 非 null，必须无条件检查——这是修过的 bug），再查 rect 尺寸、`aria-hidden`。
  **aria-hidden 例外（2026-08 加）**：`aria-hidden="true"` 但位于**横向裁剪且可滚动的容器**（W3C 轮播标准结构：非活动 slide 带 aria-hidden 但仍可滚动到达，如 Mercado Libre andes-carousel——实测 22 个 slide 只有活动的一个不带 aria-hidden，不加例外会漏掉整个商品网格）内的内容仍视为可见、参与翻译。判定 `isInsideHorizScrollable()`：任一祖先 `scrollWidth > clientWidth + 1` 且 `overflow-x` 为 `hidden/auto/scroll`（两条都满足才放行，避免把普通页面横向溢出当轮播）。
- `isTargetLangText`：>30% 字符命中目标语 script 即跳过；**日语汉字属 CJK 区，目标语言为中文时日语段落会被误判跳过**（已知行为，勿在未讨论时改动）。

## 已知行为 / 陷阱

- **li/td/th 的译文在原文节点内部**：`renderOne` 对 li/td/th 把译文 span `appendChild` 到原文内，因此译后 `node.textContent = 原文 + 译文`。任何"读取已译节点当前文本"的逻辑（如 `findChangedParagraphs` 的原地变化检测）必须用 `ruleFilter.getOriginalText()`（克隆后剔除 `[data-qyt-trans]`），否则会把自身译文当成文本变化 → 污染重译/循环（已修 + 回归测试）。
- **行内译文宿主的裁剪（2026-08 加）**：`<a>`/按钮等行内源元素，若宿主自带 `line-clamp` / `overflow: hidden/clip/scroll`（`hostClipsContent()` 判定，电商卡片标题常见：Mercado Libre `.poly-component__title` 2 行截断 + 固定高度），译文**不追加进内部**（会被裁掉、看似没翻译）——改为插在宿主下方作**块级兄弟节点**（`qyt-para-translation-sibling`），保留站点自己的省略样式、不撑开卡片；不裁剪的宿主维持内部行内注入（`qyt-para-translation-inline`）。
- **`findTranslationNode` 按 para-id 匹配（2026-08 加）**：译文节点带 `data-qyt-para-id`，查找时按本段落的 para-id 精确匹配（兄弟节点和内部节点都校验），**不能**用 `querySelector('[data-qyt-trans]')` 取任意后代——已翻译的 `<li>` 内嵌套已翻译的 `<a>`（tandfonline 参考文献 + getFTR 按钮）时，外层重译会把内层按钮的译文节点覆盖成整条引用长文。
- **同域 URL 重写不替换 DOM**：如 MDN 加载后 pushState 到 canonical URL，会触发 `handleUrlChange` → `extract()`。`extract()` 现在保留仍挂在文档上的段落记录（只丢弃 detached 的），否则记录丢失后原地变化检测永久失效（已修）。
- **`elementsToParagraphs` / `extractNewParagraphs`（site-rule 路径）统一走 `passesFilters()`**（ruleFilter 导出），过滤规则单一入口；改规则只需改 `judge`/`filterParagraphs`。

## 决策红线（重要）

在动手改规则前，先自问：

1. **通用吗？** 针对 HTML 标准语义或某一类网站的共同结构，而不是只修单个网站。
2. **低风险吗？** 改动是否可能误伤其他页面/其他规则（如：把行内 `<span>` 加入候选会误收集按钮/徽章/导航文本——高风险，需要更谨慎的判定）。
3. **有把握吗？** 拿不准的（例如 isTargetLangText 的语言判定、容器覆盖率阈值）先做小实验验证，再决定。

**任一答案为"否"→ 放弃修改**，不要贸然改规则。
