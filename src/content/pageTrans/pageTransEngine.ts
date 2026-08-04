/**
 * PageTransEngine -- page translation engine
 *
 * Responsibilities:
 * 1. Walk the DOM and extract translatable paragraph nodes
 * 2. Manage the translation status of each paragraph
 * 3. Call background translation services (via Port)
 * 4. Control concurrent translation (batching + throttling)
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
import { defaultTransEngine } from '@/config'

/* ============================================================
   Translatable target tags (block-level text elements)
   ============================================================ */
const TARGET_TAGS = new Set([
  'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'li', 'td', 'th', 'blockquote', 'figcaption',
  'dt', 'dd', 'caption',
  // Modern card/feed UIs often render titles in <a> (e.g. Reddit's a[slot=title])
  'a',
])

/* ============================================================
   Tags excluded from translation
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
  /* ---- State ---- */
  status: EngineStatus = 'idle'
  paragraphs: Paragraph[] = []
  processedCount = 0
  totalCount = 0
  config: PageTransConfig = { ...defaultPageTransConfig }
  targetLang = 'zh-CN'
  currentEngine: string | null = null

  /* ---- Dependencies ---- */
  renderEngine: RenderEngine
  private port: chrome.runtime.Port | null = null
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null

  /* ---- Destroyed flag ---- */
  private destroyed = false

  /* ---- Dynamic content observation ---- */
  private mutationObserver: MutationObserver | null = null
  private observerDebounceTimer: ReturnType<typeof setTimeout> | null = null
  private observerSelector = ''

  /* ---- Callbacks ---- */
  onProgress?: (done: number, total: number) => void
  onStatusChange?: (status: EngineStatus) => void
  onError?: (error: Error) => void

  constructor() {
    this.renderEngine = new RenderEngine()
  }

  /* ============================================================
     Initialization: connect to background
     ============================================================ */
  async init(config?: Partial<PageTransConfig>): Promise<void> {
    if (config) Object.assign(this.config, config)
    await this.loadConfigFromStorage()
    // Read the user's target language preference
    const result = await chrome.storage.sync.get(['toLang', 'mainLang'])
    this.targetLang = result.toLang || result.mainLang || 'zh-CN'
    this.connectPort()
  }

  /** Load page translation config from storage */
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
    // Clear any existing reconnect timer to avoid duplicates
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    try {
      this.port = chrome.runtime.connect({ name: 'pageTrans' })
      this.port.onDisconnect.addListener(() => {
        this.port = null
        // Reconnect after disconnect
        if (!this.destroyed) {
          this.reconnectTimer = setTimeout(() => this.connectPort(), 1000)
        }
      })
    } catch {
      // Service Worker not ready yet, retry later
      if (!this.destroyed) {
        this.reconnectTimer = setTimeout(() => this.connectPort(), 1000)
      }
    }
  }

  /* ============================================================
     Update configuration
     ============================================================ */
  updateConfig(config: Partial<PageTransConfig>): void {
    Object.assign(this.config, config)
  }

  setTargetLang(lang: string): void {
    this.targetLang = lang
  }

  /* ============================================================
     Main content container lookup strategy
     ============================================================ */
  private findMainContentContainer(): Element | null {
    // 1. Explicit semantic container (role="main" / <main>) — unambiguous, trust it
    const semantic =
      document.querySelector<Element>('[role="main"]') ||
      document.querySelector<Element>('main')
    if (semantic) return semantic

    // 2. <article> is often used for cards/list items (product cards, stat cards,
    //    news summaries, etc.); the first <article> may just be a small card,
    //    not the whole page body. Only treat it as the body container when it
    //    contains enough content.
    const article = document.querySelector<Element>('article')
    if (article && this.isContentRichContainer(article)) return article

    // 3. Find the text-densest region (excluding non-content areas)
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

    // 4. Coverage check: landing/card-grid pages often lack <main>, with content
    //    spread across sibling <section>/<div>s (hero, feature, faq…), so the
    //    density algorithm only picks one of them. If the best container covers
    //    only a small fraction of the page's translatable nodes, return null so
    //    the caller falls back to a full document.body scan (isInNonContentArea
    //    filters nav, header, footer, sidebar, etc.).
    if (best) {
      const TARGET =
        'p, li, h1, h2, h3, h4, h5, h6, td, th, blockquote, figcaption, dt, dd, caption'
      const bestTargets = best.querySelectorAll(TARGET).length
      const bodyTargets = document.body.querySelectorAll(TARGET).length
      if (bestTargets < bodyTargets * 0.5) {
        return null
      }
    }

    return best
  }

  /** Whether the element contains enough body content (avoid treating cards/list items as page containers) */
  private isContentRichContainer(el: Element): boolean {
    const text = el.textContent?.trim() || ''
    if (text.length < 100) return false
    // Long text (>=200) or multiple block text nodes qualify as a body container
    const targetCount = el.querySelectorAll(
      'p, li, h1, h2, h3, h4, h5, h6, blockquote'
    ).length
    return text.length >= 200 || targetCount >= 3
  }

  /** Combined non-content selectors (single closest() match) */
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

  /* ---- Whether an element is in a non-content area ---- */
  private isInNonContentArea(el: Element): boolean {
    // Layer 1: combined selector single match
    if (el.closest(PageTransEngine.NON_CONTENT_SELECTOR)) return true

    // Layer 2: link-density heuristic — if link text is > 50% of a container's
    // text with an average < 25 chars per link, it's likely navigation
    const parent = el.closest('li, p, h1, h2, h3, h4, h5, h6, td, th, div, section')
    if (!parent) return false

    // Only check short text blocks (nav text is usually short)
    const totalText = (parent.textContent || '').trim()
    if (totalText.length > 300) return false  // long text can't be navigation

    // Calculate link text ratio
    const links = parent.querySelectorAll('a, button')
    if (links.length < 2) return false

    let linkTextLen = 0
    let maxLinkLen = 0
    links.forEach(a => {
      const len = (a.textContent || '').trim().length
      linkTextLen += len
      if (len > maxLinkLen) maxLinkLen = len
    })

    // Most text inside links with short average length → navigation
    const linkRatio = linkTextLen / Math.max(totalText.length, 1)
    const avgLinkLen = linkTextLen / links.length

    // A long link (e.g. an article/post title, HN title links are ~21 chars) means it's content, not nav
    return linkRatio > 0.5 && avgLinkLen < 25 && maxLinkLen < 20
  }

  /* ============================================================
     Core: extract translatable paragraphs
     ============================================================ */
  /* ---- Convert candidate Element[] to Paragraph[] ---- */
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

      // Skip non-translatable tags
      if (SKIP_TAGS.has(el.tagName.toLowerCase())) continue
      // Skip elements declaring excluded roles
      const role = el.getAttribute('role')
      if (role && SKIP_ROLES.has(role)) continue
      if (el.closest('[role]') && SKIP_ROLES.has(el.closest('[role]')!.getAttribute('role')!)) continue
      // Skip non-content areas (nav, sidebar, etc.)
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
     Collect translatable candidate nodes
     ============================================================ */
  /**
   * Collect translatable candidate nodes:
   * 1. Standard block text tags (TARGET_TAGS), excluding duplicates nested inside
   *    another translatable tag
   * 2. Bare-text <div>s (frameworks like React/Vue often render body text directly
   *    into child-less divs, e.g. Reddit's new UI card bodies, modern feeds).
   *    Requires >= 30 chars to avoid timestamps/badges/button labels being
   *    treated as content.
   */
  private collectCandidates(root: Element): Element[] {
    // Table/list/definition-list are structural boundaries: content past a
    // boundary is an independent text unit, so nested layouts like
    // <td><table><tr><td>… no longer treat ancestors as duplicates
    const STRUCTURAL = new Set(['table', 'ul', 'ol', 'dl'])
    const seen = new Set<Element>()
    const result: Element[] = []

    // 1. Standard block text tags
    const targets = root.querySelectorAll<Element>([...TARGET_TAGS].join(','))
    targets.forEach((el) => {
      if (seen.has(el)) return

      // Skip structural containers: an element directly wrapping
      // table/ul/ol/dl is a layout container, not a text unit
      // (e.g. HN's <td><table>…</table></td>, otherwise the whole
      // table would be treated as one block of text)
      let child = el.firstElementChild
      while (child) {
        if (STRUCTURAL.has(child.tagName.toLowerCase())) {
          seen.add(el)
          return
        }
        child = child.nextElementSibling
      }

      // Exclude duplicates of an ancestor node (e.g. <a> inside <p>);
      // the check resets past structural boundaries
      let parent = el.parentElement
      while (
        parent &&
        parent !== root &&
        !STRUCTURAL.has(parent.tagName.toLowerCase())
      ) {
        if (TARGET_TAGS.has(parent.tagName.toLowerCase()) && !this.isInNonContentArea(parent)) {
          seen.add(el)
          return
        }
        parent = parent.parentElement
      }
      seen.add(el)
      result.push(el)
    })

    // 2. Bare-text divs
    const divs = root.querySelectorAll<Element>('div')
    divs.forEach((el) => {
      if (seen.has(el) || el.children.length > 0) return
      const text = el.textContent?.trim() ?? ''
      if (text.length < 30) return
      seen.add(el)
      result.push(el)
    })

    return result
  }

  /* ============================================================
     Core: extract translatable paragraphs
     ============================================================ */
  extract(): Paragraph[] {
    this.setStatus('extracting')
    this.paragraphs = []

    // 1. Check for site-specific rules first
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

    // 2. Generic heuristic algorithm
    const container = this.findMainContentContainer()
    const root = container || document.body

    const candidates = this.collectCandidates(root)
    const result: Paragraph[] = []

    candidates.forEach((el) => {
      if (this.isInNonContentArea(el)) return

      if (
        el.hasAttribute(ATTR.processed) ||
        el.hasAttribute(ATTR.translation) ||
        el.closest(`[${ATTR.translation}]`)
      ) {
        return
      }

      // Skip non-translatable tags
      if (SKIP_TAGS.has(el.tagName.toLowerCase())) return
      // Skip elements declaring excluded roles
      const role = el.getAttribute('role')
      if (role && SKIP_ROLES.has(role)) return
      if (el.closest('[role]') && SKIP_ROLES.has(el.closest('[role]')!.getAttribute('role')!)) return

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

    // Mark these nodes as processed (prevent re-extraction)
    result.forEach((p) => {
      p.node.setAttribute(ATTR.processed, 'true')
    })

    this.setStatus('idle')
    return result
  }

  /* ---- Whether an element is visible on the page ---- */
  private isElementVisible(el: Element): boolean {
    // 1. Check offsetParent first (excludes display:none elements)
    const htmlEl = el as HTMLElement
    if (htmlEl.offsetParent === null) {
      // null offsetParent isn't necessarily invisible (e.g. fixed elements);
      // fall back to computed style
      const style = window.getComputedStyle(el)
      if (style.display === 'none') return false
      if (style.visibility === 'hidden') return false
      if (parseFloat(style.opacity) < 0.01) return false
    }

    // 2. Check element size is non-zero
    const rect = el.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return false

    // 3. Check element or ancestors for aria-hidden
    if (el.closest('[aria-hidden="true"]')) return false

    return true
  }

  /* ---- Send analytics event ---- */
  private sendAnalytic(name: string, params: Record<string, any>): void {
    try {
      const port = chrome.runtime.connect({ name: 'analytic' })
      params.locale = chrome.i18n.getMessage('@@ui_locale')
      port.postMessage(new Context({ name, params }))
      port.disconnect()
    } catch {
      // Fail silently, don't affect translation
    }
  }

  /* ---- Resolve the default translation engine ---- */
  private async resolveDefaultEngine(): Promise<string> {
    try {
      const conf = await chrome.storage.sync.get(['transEngine'])
      // Keep consistent with the settings page (getTransConf)
      return conf.transEngine || defaultTransEngine
    } catch {
      return defaultTransEngine
    }
  }

  /* ---- Whether a paragraph is worth translating ---- */
  private shouldTranslate(text: string): boolean {
    if (text.length < MIN_TEXT_LENGTH) return false
    if (text.length > MAX_TEXT_LENGTH) return false
    // Exclude pure digits/symbols/whitespace (Unicode punctuation covers all languages)
    if (/^[\d\s\p{P}]+$/u.test(text)) return false
    // Exclude pure URLs (link-post/source-link text should not be translated)
    if (/^https?:\/\/\S+$/i.test(text)) return false
    // If target lang isn't auto and the text is already in the target lang, skip
    if (this.targetLang !== 'auto' && isTargetLangText(text, this.targetLang)) {
      return false
    }
    return true
  }

  /* ============================================================
     Batch translation
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

    // When no engine specified, stay consistent with background (storage.transEngine, default defaultTransEngine)
    const resolvedEngine = engine || (await this.resolveDefaultEngine())
    engine = resolvedEngine
    this.currentEngine = resolvedEngine

    // Analytics: batch translation start
    this.sendAnalytic('pageTrans_start', {
      total: pending.length,
      targetLang: this.targetLang,
      engine,
      hostname: location.hostname,
    })

    // Batched concurrency
    const { batchSize, concurrency } = this.config
    for (let i = 0; i < pending.length; i += batchSize) {
      const batch = pending.slice(i, i + batchSize)
      await this.translateBatch(batch, concurrency, engine)
      this.renderEngine.renderBatch(batch, this.config.displayMode, this.config.transStyle)
    }

    this.setStatus('translated')

    // Start dynamic content observation
    this.startDynamicObserver()

    // Analytics: batch translation end
    const done = pending.filter((p) => p.status === 'done').length
    const failed = pending.filter((p) => p.status === 'error').length
    const duration = Date.now() - translateStartTime
    this.sendAnalytic('pageTrans_end', {
      total: pending.length,
      done,
      failed,
      duration,
      targetLang: this.targetLang,
      engine,
      hostname: location.hostname,
    })
  }

  /* ---- Translate a batch of paragraphs (concurrency control) ---- */
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
          // Exponential backoff: 1s → 2s → 4s
          await new Promise(r => setTimeout(r, 1000 * Math.pow(2, retries - 1)))
        }
      }

      this.processedCount++
      this.onProgress?.(this.processedCount, this.totalCount)
    }
  }

  /* ---- Call background translation ---- */
  private callTranslate(para: Paragraph, engine?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.port) {
        reject(new Error('Port not connected'))
        return
      }

      const id = uuid()
      let settled = false

      // LLM engines may translate long text slowly, use a longer timeout
      const isLLMEngine = !!engine && engine.startsWith('llm__')
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
     Render bilingual results
     ============================================================ */
  render(): void {
    const done = this.paragraphs.filter((p) => p.status === 'done')
    this.renderEngine.renderBatch(done, this.config.displayMode, this.config.transStyle)
  }

  /* ============================================================
     Dynamic content observation — watch DOM changes and translate newly loaded content
     ============================================================ */
  private startDynamicObserver(): void {
    this.stopDynamicObserver()

    // Determine observation scope
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
      // Only process new nodes in translated state
      if (this.status !== 'translated') return

      const hasAddedNodes = mutations.some((m) => m.addedNodes.length > 0)
      if (!hasAddedNodes) return

      // Debounce: merge multiple changes within 500ms
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

  /** Extract and translate newly loaded paragraphs */
  private async translateNewContent(): Promise<void> {
    const newParagraphs = this.extractNewParagraphs()
    if (newParagraphs.length === 0) return

    this.paragraphs = this.paragraphs.concat(newParagraphs)

    const pending = newParagraphs.filter(
      (p) => p.status === 'pending'
    )
    if (pending.length === 0) return

    // Translate in batches
    const { batchSize, concurrency } = this.config
    for (let i = 0; i < pending.length; i += batchSize) {
      const batch = pending.slice(i, i + batchSize)
      await this.translateBatch(batch, concurrency, this.currentEngine || undefined)
      this.renderEngine.renderBatch(batch, this.config.displayMode, this.config.transStyle)
    }
  }

  /** Extract translatable paragraphs from newly added DOM (reuses extract's filtering logic) */
  private extractNewParagraphs(): Paragraph[] {
    const result: Paragraph[] = []
    const siteRule = getSiteRule()

    // Collect all matching new elements
    const candidates: Element[] = []
    const visited = new Set<Element>()

    if (siteRule && siteRule.customExtract) {
      // For sites with custom rules (e.g. YouTube), scan the whole page
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
      // Generic: same scope as the initial extraction
      const container = this.findMainContentContainer()
      const root = container || document.body
      const allElements = this.collectCandidates(root)
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
      // Skip non-content areas
      if (this.isInNonContentArea(el)) continue
      // Skip non-translatable tags
      if (SKIP_TAGS.has(el.tagName.toLowerCase())) continue
      // Skip elements declaring excluded roles
      const role = el.getAttribute('role')
      if (role && SKIP_ROLES.has(role)) continue
      if (el.closest('[role]') && SKIP_ROLES.has(el.closest('[role]')!.getAttribute('role')!)) continue

      if (!this.isElementVisible(el)) continue

      const text = el.textContent?.trim() ?? ''
      if (!this.shouldTranslate(text)) continue

      // Mark as processed
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
     Restore original text: remove all translation nodes and restore the page
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
     Toggle translation/original
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
     Destroy: clean up resources
     ============================================================ */
  destroy(): void {
    this.destroyed = true
    // Cancel reconnect timer
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.port) {
      try { this.port.disconnect() } catch { /* ignore */ }
      this.port = null
    }
    this.stopDynamicObserver()
    this.paragraphs = []
    this.setStatus('idle')
  }

  /* ============================================================
     Status management
     ============================================================ */
  private setStatus(status: EngineStatus): void {
    this.status = status
    this.onStatusChange?.(status)
  }
}
