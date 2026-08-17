/**
 * RenderEngine —— 双语渲染引擎
 *
 * 职责：
 * 1. 将译文节点插入到原文节点下方
 * 2. 支持双语/仅译文两种显示模式
 * 3. 支持多种译文样式
 * 4. 恢复原文时移除所有注入节点
 */
import {
  Paragraph,
  TransDisplayMode,
  TransStyle,
  ATTR,
  CLS,
} from './types'

/* ============================================================
   样式注入 —— 引用计数，多实例安全
   ============================================================ */
let styleRefCount = 0

const STYLE_ID = 'qyt-trans-styles'

function injectStyles(): void {
  styleRefCount++
  if (document.getElementById(STYLE_ID)) return

  const css = `
/* ---- QY Translate: 页面翻译样式 ---- */
.${CLS.wrapper} {
  position: relative;
  clear: both;
}

.${CLS.original}[data-qyt-original="true"] {
  /* 原文标记 */
}

/* ---- 原文标记（默认不变，开启淡化时生效） ---- */
.${CLS.original} {
  transition: opacity 0.2s;
}

/* 淡化原文开关 */
.qyt-dim-original .${CLS.original} {
  opacity: 0.55;
}

/* ---- 译文基础样式 ---- */
.${CLS.translation} {
  display: block;
  margin: 2px 0;
  padding: 0;
  line-height: 1.6;
  word-wrap: break-word;
  white-space: pre-wrap;
  transition: opacity 0.2s;
}

/* 行内译文：<a> 等行内源元素的译文紧跟原文同一行，不换行堆叠 */
.${CLS.translationInline} {
  display: inline;
  margin: 0 0 0 0.35em;
  vertical-align: middle;
  white-space: normal;
}

/* ---- 翻译中动画 ---- */
.${CLS.translating}::after {
  content: '';
  display: inline-block;
  width: 10px;
  height: 10px;
  margin-left: 6px;
  border: 2px solid rgba(76, 139, 245, 0.25);
  border-top-color: #4C8BF5;
  border-radius: 50%;
  vertical-align: middle;
  animation: qyt-spin 0.8s linear infinite;
}

@keyframes qyt-spin {
  to {
    transform: rotate(360deg);
  }
}

/* ===== 各样式 ===== */

/* 无样式 */
.qyt-style-none .${CLS.translation} {
  color: inherit;
  background: none;
  text-decoration: none;
}

/* 虚线下划线 */
.qyt-style-underline .${CLS.translation} {
  text-decoration: underline;
  text-decoration-color: #4C8BF5;
  text-underline-offset: 2px;
}

/* 虚线边框 */
.qyt-style-dashed .${CLS.translation} {
  border-bottom: 1px dashed #4C8BF5;
  padding-bottom: 1px;
}

/* 点状下划线 */
.qyt-style-dotted .${CLS.translation} {
  text-decoration: underline dotted #4C8BF5;
  text-underline-offset: 2px;
}

/* 高亮 */
.qyt-style-highlight .${CLS.translation} {
  background: linear-gradient(180deg, transparent 60%, rgba(76, 139, 245, 0.25) 60%);
  display: inline;
}

/* 马克笔 */
.qyt-style-marker .${CLS.translation} {
  background: rgba(76, 139, 245, 0.15);
  border-radius: 2px;
  padding: 0 2px;
}

/* 模糊效果（学习模式） */
.qyt-style-blur .${CLS.translation} {
  filter: blur(4px);
  cursor: pointer;
  transition: filter 0.2s;
}
.qyt-style-blur .${CLS.translation}:hover {
  filter: none;
}

/* 背景色 */
.qyt-style-bgColor .${CLS.translation} {
  background-color: rgba(76, 139, 245, 0.08);
  border-radius: 3px;
  padding: 1px 3px;
}

/* 实线边框 */
.qyt-style-border .${CLS.translation} {
  border-left: 3px solid #4C8BF5;
  padding-left: 8px;
}
`

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = css
  document.head.appendChild(style)
}

function removeStyles(): void {
  styleRefCount--
  if (styleRefCount <= 0) {
    styleRefCount = 0
    const style = document.getElementById(STYLE_ID)
    style?.remove()
  }
}

/* ============================================================
   RenderEngine
   ============================================================ */
export class RenderEngine {
  private currentStyle: TransStyle = 'none'

  constructor() {
    injectStyles()
  }

  /* ============================================================
     批量渲染一批段落
     ============================================================ */
  renderBatch(
    paragraphs: Paragraph[],
    displayMode: TransDisplayMode,
    style: TransStyle
  ): void {
    this.currentStyle = style
    this.applyStyleClass(style)

    paragraphs.forEach((p) => {
      if (p.status !== 'done' || !p.translatedText) return
      this.renderOne(p, displayMode)
    })
  }

  /* ============================================================
     渲染单个段落
     ============================================================ */
  private renderOne(para: Paragraph, mode: TransDisplayMode): void {
    const node = para.node

    // 翻译完成，移除翻译中状态（恢复原文透明度）
    node.classList.remove(CLS.translating)

    // 译文已存在则更新内容
    const existing = this.findTranslationNode(node)
    if (existing) {
      existing.textContent = para.translatedText
      return
    }

    // 译文节点放置策略：
    //  - li/td/th: 追加到元素内部（避免破坏列表/表格结构）
    //  - 父容器为 flex/grid 的元素:同样追加到元素内部。若在原文后面插入兄弟
    //    节点，译文会变成容器的新 flex/grid item，打乱卡片网格/标题栏等布局
    //    （KEYENCE 商品页实例：h2/a 变成额外 flex item，出现大片空白与排版交叉）
    //  - 其余块级元素:在原文节点后面插入（保持句子/段落级双语排布）
    const tag = node.tagName.toLowerCase()
    const isInline = ['li', 'td', 'th'].includes(tag)
    const parentDisplay = node.parentElement
      ? window.getComputedStyle(node.parentElement).display
      : ''
    const isFlexGridItem =
      parentDisplay === 'flex' ||
      parentDisplay === 'inline-flex' ||
      parentDisplay === 'grid' ||
      parentDisplay === 'inline-grid'
    const appendInside = isInline || isFlexGridItem
    // 行内源元素：译文放进链接/按钮内部，紧跟文字不换行堆叠。
    //  - <a> 链接（如「カタログで詳しく見る」）：不管 display 是 inline/
    //    inline-flex/block，兄弟 span 都可能换行到下一行，放进 <a> 内部最稳
    //  - 内容为单个 <a>/<button> 且无其他文本的目标元素（导航/按钮列表项
    //    li > a、折叠标题 h2 > button 等）：译文放进该交互元素内部
    const childCount = node.children ? node.children.length : 0
    const singleChild = childCount > 0 ? node.firstElementChild : null
    const singleChildTag = singleChild?.tagName?.toLowerCase() ?? ''
    const singleInteractive =
      childCount === 1 &&
      (singleChildTag === 'a' || singleChildTag === 'button') &&
      (node.textContent || '').trim() ===
        (singleChild?.textContent || '').trim()
    const isInlineSource = tag === 'a' || singleInteractive
    const transEl = document.createElement(
      appendInside || isInlineSource ? 'span' : tag
    )
    // 使用 textContent + pre-wrap 避免 XSS 风险
    transEl.textContent = para.translatedText
    transEl.setAttribute(ATTR.translation, 'true')
    transEl.setAttribute(ATTR.paraId, para.id)
    transEl.className = CLS.translation
    transEl.classList.remove(CLS.translating)
    if (isInlineSource) transEl.classList.add(CLS.translationInline)

    // 行内源元素：译文放进链接/按钮内部，紧跟链接文字
    if (isInlineSource) {
      const host = tag === 'a' ? node : node.firstElementChild!
      host.appendChild(transEl)
      return
    }

    // li/td/th 及 flex/grid item: 追加到元素内部，不破坏布局结构
    if (appendInside) {
      node.appendChild(transEl)
      return
    }

    // 在原文节点后面插入
    node.parentNode?.insertBefore(transEl, node.nextSibling)

    // 如果是仅译文模式，隐藏原文
    if (mode === 'targetOnly') {
      node.setAttribute('data-qyt-hidden', 'true')
      ;(node as HTMLElement).style.display = 'none'
    }

    // 标记原文
    node.setAttribute(ATTR.original, 'true')
    node.classList.add(CLS.original)
  }

  /* ============================================================
     为段落添加"翻译中"标记
     ============================================================ */
  markTranslating(para: Paragraph): void {
    para.node.classList.add(CLS.translating)
  }

  /** 移除"翻译中"标记（翻译失败时恢复原文外观） */
  clearTranslating(para: Paragraph): void {
    para.node.classList.remove(CLS.translating)
  }

  /* ============================================================
     查找已有译文节点
     ============================================================ */
  private findTranslationNode(
    originalNode: Element
  ): Element | null {
    // 先查下一个兄弟节点
    const next = originalNode.nextElementSibling
    if (next && next.hasAttribute(ATTR.translation)) {
      return next
    }
    // li/td/th 或 flex/grid item: 译文在原文内部
    const child = originalNode.querySelector(`[${ATTR.translation}]`)
    if (child) return child
    return null
  }

  /* ============================================================
     还原所有译文
     ============================================================ */
  restoreAll(): void {
    // 移除所有译文节点
    const transNodes = document.querySelectorAll(`[${ATTR.translation}]`)
    transNodes.forEach((el) => el.remove())

    // 清除残留的"翻译中"标记（失败段落不会被 renderOne 清理）
    document
      .querySelectorAll(`.${CLS.translating}`)
      .forEach((el) => el.classList.remove(CLS.translating))

    // 恢复隐藏的原文
    const hiddenOriginals = document.querySelectorAll(`[${ATTR.original}]`)
    hiddenOriginals.forEach((el) => {
      el.removeAttribute(ATTR.original)
      ;(el as HTMLElement).style.display = ''
    })

    // 清除 processed 标记
    const processed = document.querySelectorAll(`[${ATTR.processed}]`)
    processed.forEach((el) => el.removeAttribute(ATTR.processed))

    // 清除 body 上的淡化类
    document.body.classList.remove('qyt-dim-original')
  }

  /* ============================================================
     切换译文样式
     ============================================================ */
  private applyStyleClass(style: TransStyle): void {
    // 移除旧的样式类
    const allStyles = [
      'none', 'underline', 'dashed', 'dotted',
      'highlight', 'marker', 'blur', 'bgColor', 'border',
    ]
    allStyles.forEach((s) => {
      document.body.classList.remove(`qyt-style-${s}`)
    })
    document.body.classList.add(`qyt-style-${style}`)
    this.currentStyle = style
  }

  /** 外部：直接应用样式（不触发渲染） */
  applyStyle(style: TransStyle): void {
    this.applyStyleClass(style)
  }

  /** 切换原文淡化 */
  applyDimOriginal(dim: boolean): void {
    if (dim) {
      document.body.classList.add('qyt-dim-original')
    } else {
      document.body.classList.remove('qyt-dim-original')
    }
  }

  /* ============================================================
     切换显示模式（双语 / 仅译文）
     ============================================================ */
  switchMode(mode: TransDisplayMode): void {
    const originalNodes = document.querySelectorAll(`[${ATTR.original}]`)
    originalNodes.forEach((el) => {
      if (mode === 'targetOnly') {
        el.setAttribute('data-qyt-hidden', 'true')
        ;(el as HTMLElement).style.display = 'none'
      } else {
        el.removeAttribute('data-qyt-hidden')
        ;(el as HTMLElement).style.display = ''
      }
    })
  }

  /* ============================================================
     销毁
     ============================================================ */
  destroy(): void {
    this.restoreAll()
    removeStyles()
  }
}
