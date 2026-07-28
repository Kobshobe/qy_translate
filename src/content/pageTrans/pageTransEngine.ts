/**
 * PageTransEngine -- 页面翻译引擎
 *
 * 职责:
 * 1. 遍历 DOM,提取可翻译的段落节点
 * 2. 管理每个段落的翻译状态
 * 3. 调用 background 的翻译服务(通过 Port)
 * 4. 控制并发翻译(批量 + 节流)
 */
import { v4 as uuid } from 'uuid'
import {
  Paragraph,
  EngineStatus,
  PageTransConfig,
  defaultPageTransConfig,
  TransStyle,
  TransDisplayMode,
  ATTR,
} from './types'
import { RenderEngine } from './renderEngine'
import { isTargetLangText } from '@/translator/trans_base'
import { getSiteRule, extractWithSiteRule } from './siteRules'
import { Context } from '@/api/context'

/* ============================================================
   可翻译的目标标签(块级文本元素)
   ============================================================ */
const TARGET_TAGS = new Set([
  'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'li', 'td', 'th', 'blockquote', 'figcaption',
  'dt', 'dd', 'caption',
])

/* ============================================================
   排除不可翻译的标签
   ============================================================ */
const SKIP_TAGS = new Set([
  'script', 'style', 'noscript', 'code', 'pre',
  'svg', 'math', 'canvas', 'video', 'audio',
  'textarea', 'select', 'option',
])

const SKIP_ROLES = new Set([
  'navigation', 'banner', 'complementary', 'contentinfo',
  'alert', 'dialog', 'toolbar', 'menu', 'menubar',
  'tabpanel', 'presentation',
])

const MIN_TEXT_LENGTH = 2
const MAX_TEXT_LENGTH = 5000

/* ============================================================
   PageTransEngine
   ============================================================ */
export class PageTransEngine {
  /* ---- 状态 ---- */
  status: EngineStatus = 'idle'
  paragraphs: Paragraph[] = []
  processedCount = 0
  totalCount = 0
  config: PageTransConfig = { ...defaultPageTransConfig }
  targetLang = 'zh-CN'

  /* ---- 依赖 ---- */
  renderEngine: RenderEngine
  private port: chrome.runtime.Port | null = null
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null

  /* ---- 销毁标记 ---- */
  private destroyed = false

  /* ---- 动态内容观察 ---- */
  private mutationObserver: MutationObserver | null = null
  private observerDebounceTimer: ReturnType<typeof setTimeout> | null = null
  private observerSelector = ''

  /* ---- 回调 ---- */
  onProgress?: (done: number, total: number) => void
  onStatusChange?: (status: EngineStatus) => void
  onError?: (error: Error) => void

  constructor() {
    this.renderEngine = new RenderEngine()
  }

  /* ============================================================
     初始化:建立与 background 的通信连接
     ============================================================ */
  async init(config?: Partial<PageTransConfig>): Promise<void> {
    if (config) Object.assign(this.config, config)
    await this.loadConfigFromStorage()
    // 读取用户目标语言偏好
    const result = await chrome.storage.sync.get(['toLang', 'mainLang'])
    this.targetLang = result.toLang || result.mainLang || 'zh-CN'
    this.connectPort()
  }

  /** 从 storage 加载页面翻译配置 */
  private async loadConfigFromStorage(): Promise<void> {
    const result = await chrome.storage.sync.get(['pageTransStyle', 'pageTransDisplayMode', 'pageTransDimOriginal'])
    if (result.pageTransStyle) {
      this.config.transStyle = result.pageTransStyle as TransStyle
      this.renderEngine.applyStyle(result.pageTransStyle as TransStyle)
    }
    if (result.pageTransDisplayMode) {
      this.config.displayMode = result.pageTransDisplayMode as TransDisplayMode
    }
    if (result.pageTransDimOriginal !== undefined) {
      this.renderEngine.applyDimOriginal(result.pageTransDimOriginal)
    }
  }

  private connectPort(): void {
    if (this.destroyed) return
    // 清除已有重连定时器，防止重复
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    try {
      this.port = chrome.runtime.connect({ name: 'pageTrans' })
      this.port.onDisconnect.addListener(() => {
        this.port = null
        // 断线后重连
        if (!this.destroyed) {
          this.reconnectTimer = setTimeout(() => this.connectPort(), 1000)
        }
      })
    } catch {
      // Service Worker 尚未就绪,稍后重试
      if (!this.destroyed) {
        this.reconnectTimer = setTimeout(() => this.connectPort(), 1000)
      }
    }
  }

  /* ============================================================
     更新配置
     ============================================================ */
  updateConfig(config: Partial<PageTransConfig>): void {
    Object.assign(this.config, config)
  }

  setTargetLang(lang: string): void {
    this.targetLang = lang
  }

  /* ============================================================
     主要内容容器查找策略
     ============================================================ */
  private findMainContentContainer(): Element | null {
    // 1. 优先使用语义化标签
    const candidates = [
      document.querySelector<Element>('[role="main"]'),
      document.querySelector<Element>('main'),
      document.querySelector<Element>('article'),
    ].filter(Boolean)
    if (candidates.length > 0) return candidates[0]!

    // 2. 查找文本最密集的区域（排除非内容区）
    const contentLikeTags = ['div', 'section', 'article']
    let best: Element | null = null
    let bestScore = 0

    for (const tag of contentLikeTags) {
      for (const el of document.querySelectorAll<Element>(tag)) {
        if (this.isInNonContentArea(el)) continue
        const text = el.textContent?.trim() || ''
        if (text.length < 200) continue
        const pCount = el.querySelectorAll('p, li, h1, h2, h3, h4, h5, h6').length
        const score = text.length * Math.min(pCount, 50)
        if (score > bestScore) {
          bestScore = score
          best = el
        }
      }
    }

    return best
  }

  /** 合并的非内容区选择器（单次 closest() 匹配全部） */
  private static readonly NON_CONTENT_SELECTOR = [
    'nav', 'header', 'footer', 'aside',
    '[role="navigation"]', '[role="banner"]', '[role="contentinfo"]',
    '[role="complementary"]', '[role="tabpanel"]', '[role="tablist"]',
    '[role="menubar"]', '[role="search"]',
    '.sidebar', '.Sidebar', '#sidebar', '#Sidebar',
    '.footer', '.Header', '.header',
    '.nav', '.Nav', '#nav', '#Nav',
    '.menu', '.Menu', '.toolbar', '.Toolbar',
    '.dropdown', '.Dropdown',
    '.tabnav', '.TabNav', '.UnderlineNav', '.underline-nav',
    '.tab-bar', '.TabBar', '.tabs', '.Tabs',
    '.breadcrumb', '.Breadcrumb', '.Breadcrumbs',
    '.pagination', '.Pagination',
    '.search', '.Search', '#search', '#Search',
    '.subnav', '.SubNav',
  ].join(',')

  /* ---- 判断元素是否在非内容区 ---- */
  private isInNonContentArea(el: Element): boolean {
    // 第一层: 合并选择器单次匹配
    if (el.closest(PageTransEngine.NON_CONTENT_SELECTOR)) return true

    // 第二层: 链接密度启发式检测
    // 如果一个容器中，链接文本占比 > 50% 且每条平均 < 25 字符，很可能是导航
    const parent = el.closest('li, p, h1, h2, h3, h4, h5, h6, td, th, div, section')
    if (!parent) return false

    // 只对短文本块做检测（导航文本通常很短）
    const totalText = (parent.textContent || '').trim()
    if (totalText.length > 300) return false  // 长文本不可能是导航

    // 计算链接文本占比
    const links = parent.querySelectorAll('a, button')
    if (links.length < 2) return false

    let linkTextLen = 0
    links.forEach(a => { linkTextLen += (a.textContent || '').trim().length })

    // 如果链接文本占绝大部分，且平均链接文本短 → 导航
    const linkRatio = linkTextLen / Math.max(totalText.length, 1)
    const avgLinkLen = linkTextLen / links.length

    return linkRatio > 0.5 && avgLinkLen < 25
  }

  /* ============================================================
     核心:提取可翻译段落
     ============================================================ */
  /* ---- 将候选 Element[] 转为 Paragraph[] ---- */
  private elementsToParagraphs(elements: Element[]): Paragraph[] {
    const result: Paragraph[] = []
    const seen = new Set<Element>()

    for (const el of elements) {
      if (
        seen.has(el) ||
        el.hasAttribute(ATTR.processed) ||
        el.hasAttribute(ATTR.translation)
      ) continue
      seen.add(el)

      // 跳过不可翻译标签
      if (SKIP_TAGS.has(el.tagName.toLowerCase())) continue
      // 跳过声明了排除角色的元素
      const role = el.getAttribute('role')
      if (role && SKIP_ROLES.has(role)) continue
      if (el.closest('[role]') && SKIP_ROLES.has(el.closest('[role]')!.getAttribute('role')!)) continue
      // 跳过非内容区（导航、侧栏等）
      if (this.isInNonContentArea(el)) continue

      if (!this.isElementVisible(el)) continue

      const text = el.textContent?.trim() ?? ''
      if (!this.shouldTranslate(text)) continue

      result.push({
        id: uuid(),
        node: el,
        originalText: text,
        translatedText: '',
        lang: '',
        status: 'pending',
      })
    }
    return result
  }

  /* ============================================================
     核心:提取可翻译段落
     ============================================================ */
  extract(): Paragraph[] {
    this.setStatus('extracting')
    this.paragraphs = []

    // 1. 先检查是否有站点特定规则
    const siteRule = getSiteRule()
    if (siteRule) {
      const elements = extractWithSiteRule(siteRule)
      this.paragraphs = this.elementsToParagraphs(elements)
      this.totalCount = this.paragraphs.length
      this.processedCount = 0
      this.paragraphs.forEach((p) => p.node.setAttribute(ATTR.processed, 'true'))
      this.setStatus('idle')
      return this.paragraphs
    }

    // 2. 通用启发式算法
    const container = this.findMainContentContainer()
    const root = container || document.body

    const allElements = root.querySelectorAll<Element>(
      [...TARGET_TAGS].join(',')
    )
    const seen = new Set<Element>()
    const result: Paragraph[] = []

    allElements.forEach((el) => {
      if (this.isInNonContentArea(el)) return

      if (
        seen.has(el) ||
        el.hasAttribute(ATTR.processed) ||
        el.hasAttribute(ATTR.translation) ||
        el.closest(`[${ATTR.translation}]`)
      ) {
        return
      }

      // 跳过不可翻译标签
      if (SKIP_TAGS.has(el.tagName.toLowerCase())) return
      // 跳过声明了排除角色的元素
      const role = el.getAttribute('role')
      if (role && SKIP_ROLES.has(role)) return
      if (el.closest('[role]') && SKIP_ROLES.has(el.closest('[role]')!.getAttribute('role')!)) return

      // 排除祖先重复节点
      let parent = el.parentElement
      while (parent && parent !== root) {
        if (TARGET_TAGS.has(parent.tagName.toLowerCase()) && !this.isInNonContentArea(parent)) {
          seen.add(el)
          return
        }
        parent = parent.parentElement
      }
      seen.add(el)

      if (!this.isElementVisible(el)) return

      const text = el.textContent?.trim() ?? ''
      if (!this.shouldTranslate(text)) return

      result.push({
        id: uuid(),
        node: el,
        originalText: text,
        translatedText: '',
        lang: '',
        status: 'pending',
      })
    })

    this.paragraphs = result
    this.totalCount = result.length
    this.processedCount = 0

    // 标记这些节点为已处理（防止重复提取）
    result.forEach((p) => {
      p.node.setAttribute(ATTR.processed, 'true')
    })

    this.setStatus('idle')
    return result
  }

  /* ---- 判断元素是否在页面上可见 ---- */
  private isElementVisible(el: Element): boolean {
    // 1. 先检查 offsetParent（排除 display:none 的元素）
    const htmlEl = el as HTMLElement
    if (htmlEl.offsetParent === null) {
      // offsetParent 为 null 不一定不可见（如 fixed 定位元素）
      // 再检查 computed style
      const style = window.getComputedStyle(el)
      if (style.display === 'none') return false
      if (style.visibility === 'hidden') return false
      if (parseFloat(style.opacity) < 0.01) return false
    }

    // 2. 检查元素尺寸是否为 0
    const rect = el.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return false

    // 3. 检查元素或其祖先是否有 aria-hidden
    if (el.closest('[aria-hidden="true"]')) return false

    return true
  }

  /* ---- 发送分析事件 ---- */
  private sendAnalytic(name: string, params: Record<string, any>): void {
    try {
      const port = chrome.runtime.connect({ name: 'analytic' })
      params.locale = chrome.i18n.getMessage('@@ui_locale')
      port.postMessage(new Context({ name, params }))
      port.disconnect()
    } catch {
      // 静默失败，不影响翻译
    }
  }

  /* ---- 判断段落是否值得翻译 ---- */
  private shouldTranslate(text: string): boolean {
    if (text.length < MIN_TEXT_LENGTH) return false
    if (text.length > MAX_TEXT_LENGTH) return false
    // 排除纯数字/符号/空白（Unicode 标点属性覆盖所有语言）
    if (/^[\d\s\p{P}]+$/u.test(text)) return false
    // 如果目标语言不是 auto,且文本与目标语言相同,跳过
    if (this.targetLang !== 'auto' && isTargetLangText(text, this.targetLang)) {
      return false
    }
    return true
  }

  /* ============================================================
     批量翻译
     ============================================================ */
  async translate(engine?: string): Promise<void> {
    if (this.paragraphs.length === 0) {
      this.extract()
    }
    if (this.paragraphs.length === 0) {
      this.setStatus('translated')
      return
    }

    this.setStatus('translating')
    const pending = this.paragraphs.filter(
      (p) => p.status === 'pending' || p.status === 'error'
    )
    this.totalCount = pending.length
    this.processedCount = 0
    const translateStartTime = Date.now()

    // 分析: 开始批量翻译
    this.sendAnalytic('pageTrans_start', {
      total: pending.length,
      targetLang: this.targetLang,
      engine: engine || '',
      hostname: location.hostname,
    })

    // 分批并发
    const { batchSize, concurrency } = this.config
    for (let i = 0; i < pending.length; i += batchSize) {
      const batch = pending.slice(i, i + batchSize)
      await this.translateBatch(batch, concurrency, engine)
      this.renderEngine.renderBatch(batch, this.config.displayMode, this.config.transStyle)
    }

    this.setStatus('translated')

    // 启动动态内容观察
    this.startDynamicObserver()

    // 分析: 批量翻译结束
    const done = pending.filter((p) => p.status === 'done').length
    const failed = pending.filter((p) => p.status === 'error').length
    const duration = Date.now() - translateStartTime
    this.sendAnalytic('pageTrans_end', {
      total: pending.length,
      done,
      failed,
      duration,
      targetLang: this.targetLang,
      engine: engine || '',
      hostname: location.hostname,
    })
  }

  /* ---- 翻译一批段落(并发控制) ---- */
  private async translateBatch(
    batch: Paragraph[],
    concurrency: number,
    engine?: string
  ): Promise<void> {
    const queue = [...batch]
    const workers: Promise<void>[] = []

    for (let i = 0; i < concurrency; i++) {
      workers.push(this.workerLoop(queue, engine))
    }

    await Promise.all(workers)
  }

  private async workerLoop(
    queue: Paragraph[],
    engine?: string
  ): Promise<void> {
    const maxRetries = 3

    while (queue.length > 0) {
      const para = queue.shift()!
      para.status = 'translating'
      this.renderEngine.markTranslating(para)

      let retries = 0
      while (retries <= maxRetries) {
        try {
          const result = await this.callTranslate(para, engine)
          para.translatedText = result
          para.status = 'done'
          break
        } catch (e: any) {
          if (retries >= maxRetries) {
            para.status = 'error'
            para.error = e.message
            break
          }
          retries++
          // 指数退避: 1s → 2s → 4s
          await new Promise(r => setTimeout(r, 1000 * Math.pow(2, retries - 1)))
        }
      }

      this.processedCount++
      this.onProgress?.(this.processedCount, this.totalCount)
    }
  }

  /* ---- 调用 background 翻译 ---- */
  private callTranslate(para: Paragraph, engine?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.port) {
        reject(new Error('Port not connected'))
        return
      }

      const id = uuid()
      let settled = false

      // LLM 引擎翻译长文本可能较慢，使用更长超时
      const isLLMEngine = engine === '__llm__'
      const timeoutMs = isLLMEngine ? 30000 : 15000
      const timer = setTimeout(() => {
        if (settled) return
        settled = true
        this.port?.onMessage.removeListener(handler)
        reject(new Error('Translation timeout: ' + para.originalText.slice(0, 30)))
      }, timeoutMs)

      const handler = (msg: any) => {
        if (msg.id === id) {
          clearTimeout(timer)
          if (settled) return
          settled = true
          this.port?.onMessage.removeListener(handler)
          if (msg.error) reject(new Error(msg.error))
          else resolve(msg.text)
        }
      }

      this.port.onMessage.addListener(handler)
      this.port.postMessage({
        id,
        type: 'pageTrans',
        text: para.originalText,
        from: 'auto',
        to: this.targetLang,
        engine,
      })
    })
  }

  /* ============================================================
     渲染双语结果
     ============================================================ */
  render(): void {
    const done = this.paragraphs.filter((p) => p.status === 'done')
    this.renderEngine.renderBatch(done, this.config.displayMode, this.config.transStyle)
  }

  /* ============================================================
     动态内容观察 —— 监听 DOM 变化，翻译新加载的内容
     ============================================================ */
  private startDynamicObserver(): void {
    this.stopDynamicObserver()

    // 确定观察范围
    let root: Element
    const siteRule = getSiteRule()
    if (siteRule && siteRule.mainSelector) {
      const el = document.querySelector<Element>(siteRule.mainSelector)
      root = el || document.body
      this.observerSelector = siteRule.mainSelector
    } else {
      const container = this.findMainContentContainer()
      root = container || document.body
    }

    this.mutationObserver = new MutationObserver((mutations) => {
      // 只在已翻译状态下处理新节点
      if (this.status !== 'translated') return

      const hasAddedNodes = mutations.some((m) => m.addedNodes.length > 0)
      if (!hasAddedNodes) return

      // 防抖：500ms 内多次变更合并处理
      if (this.observerDebounceTimer) clearTimeout(this.observerDebounceTimer)
      this.observerDebounceTimer = setTimeout(() => {
        this.translateNewContent().catch(() => {})
      }, 500)
    })

    this.mutationObserver.observe(root, {
      childList: true,
      subtree: true,
    })
  }

  private stopDynamicObserver(): void {
    if (this.observerDebounceTimer) {
      clearTimeout(this.observerDebounceTimer)
      this.observerDebounceTimer = null
    }
    if (this.mutationObserver) {
      this.mutationObserver.disconnect()
      this.mutationObserver = null
    }
  }

  /** 提取并翻译新加载的段落 */
  private async translateNewContent(): Promise<void> {
    const newParagraphs = this.extractNewParagraphs()
    if (newParagraphs.length === 0) return

    this.paragraphs = this.paragraphs.concat(newParagraphs)

    const pending = newParagraphs.filter(
      (p) => p.status === 'pending'
    )
    if (pending.length === 0) return

    // 分批翻译
    const { batchSize, concurrency } = this.config
    for (let i = 0; i < pending.length; i += batchSize) {
      const batch = pending.slice(i, i + batchSize)
      await this.translateBatch(batch, concurrency)
      this.renderEngine.renderBatch(batch, this.config.displayMode, this.config.transStyle)
    }
  }

  /** 从新增 DOM 中提取可翻译段落（复用现有 extract 的过滤逻辑） */
  private extractNewParagraphs(): Paragraph[] {
    const result: Paragraph[] = []
    const siteRule = getSiteRule()
    const TARGET = [...TARGET_TAGS].join(',')

    // 收集所有匹配的新元素
    const candidates: Element[] = []
    const visited = new Set<Element>()

    if (siteRule && siteRule.customExtract) {
      // 对 YouTube 等有自定义规则的站点，整体扫描
      const elements = extractWithSiteRule(siteRule)
      for (const el of elements) {
        if (
          visited.has(el) ||
          el.hasAttribute(ATTR.processed) ||
          el.hasAttribute(ATTR.translation) ||
          el.closest(`[${ATTR.translation}]`)
        ) continue
        visited.add(el)
        candidates.push(el)
      }
    } else {
      // 通用：使用与初始提取相同的范围限定
      const container = this.findMainContentContainer()
      const root = container || document.body
      const allElements = root.querySelectorAll<Element>(TARGET)
      for (const el of allElements) {
        if (
          visited.has(el) ||
          el.hasAttribute(ATTR.processed) ||
          el.hasAttribute(ATTR.translation) ||
          el.closest(`[${ATTR.translation}]`)
        ) continue
        visited.add(el)
        candidates.push(el)
      }
    }

    for (const el of candidates) {
      // 跳过非内容区域
      if (this.isInNonContentArea(el)) continue
      // 跳过不可翻译标签
      if (SKIP_TAGS.has(el.tagName.toLowerCase())) continue
      // 跳过声明了排除角色的元素
      const role = el.getAttribute('role')
      if (role && SKIP_ROLES.has(role)) continue
      if (el.closest('[role]') && SKIP_ROLES.has(el.closest('[role]')!.getAttribute('role')!)) continue

      if (!this.isElementVisible(el)) continue

      const text = el.textContent?.trim() ?? ''
      if (!this.shouldTranslate(text)) continue

      // 标记为已处理
      el.setAttribute(ATTR.processed, 'true')

      result.push({
        id: uuid(),
        node: el,
        originalText: text,
        translatedText: '',
        lang: '',
        status: 'pending',
      })
    }

    return result
  }

  /* ============================================================
     恢复原文:移除所有译文节点,还原页面
     ============================================================ */
  restore(): void {
    this.stopDynamicObserver()
    this.setStatus('restoring')
    this.renderEngine.restoreAll()
    this.paragraphs = []
    this.totalCount = 0
    this.processedCount = 0
    this.setStatus('idle')
  }

  /* ============================================================
     切换翻译/原文
     ============================================================ */
  async toggle(engine?: string): Promise<void> {
    if (this.status === 'translated') {
      this.restore()
    } else {
      this.extract()
      await this.translate(engine)
    }
  }

  /* ============================================================
     销毁:清理资源
     ============================================================ */
  destroy(): void {
    this.destroyed = true
    // 取消重连定时器
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.port) {
      try { this.port.disconnect() } catch { /* 忽略 */ }
      this.port = null
    }
    this.stopDynamicObserver()
    this.paragraphs = []
    this.setStatus('idle')
  }

  /* ============================================================
     状态管理
     ============================================================ */
  private setStatus(status: EngineStatus): void {
    this.status = status
    this.onStatusChange?.(status)
  }
}
