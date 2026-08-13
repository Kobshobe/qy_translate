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
import { TranslationCache, translationCacheKey } from './translationCache'
import { getSiteRule, extractWithSiteRule } from './siteRules'
import { Context } from '@/api/context'
import { defaultTransEngine } from '@/config'
import { BATCH_SEP } from '@/translator/batch'
import {
  shouldTranslateText,
  findMainContentContainer,
  filterParagraphs,
  passesFilters,
  getOriginalText,
} from './ruleFilter'

/**
 * Format a duration in ms as "min" format for analytics, e.g. 2m30s / 45s
 */
function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  if (minutes <= 0) return `${seconds}s`
  return seconds > 0 ? `${minutes}m${seconds}s` : `${minutes}m`
}

/** How long the "auto-translate this domain" intent stays active (6h) */
const AUTO_TRANSLATE_TTL = 6 * 60 * 60 * 1000

/**
 * LLM engines batch by char budget, not by count.
 * Cap the paragraphs per group so each batch completes in reasonable time and
 * results keep streaming in (page translation renders as batches finish).
 */
const LLM_MAX_PARAGRAPHS = 20

/**
 * sessionStorage key for the auto-translate intent.
 * sessionStorage is per-tab, in-memory and cleared when the tab closes, but it
 * survives re-injection (joinContent re-runs on some same-tab navigations) and
 * page reloads within the same tab.
 */
const PAGE_TRANS_ACTIVE_KEY = 'qyt-pageTransActive'

/**
 * Whether the current document load was triggered by a manual refresh
 * (F5 / Ctrl+R / refresh button).
 *
 * Uses the Navigation Timing API; falls back to the legacy
 * performance.navigation.type for older environments.
 */
function isManualReload(): boolean {
  try {
    const nav = performance.getEntriesByType('navigation')[0] as
      PerformanceNavigationTiming | undefined
    if (nav) return nav.type === 'reload'
    // Legacy fallback: PerformanceNavigation.TYPE_RELOAD === 1
    const legacy = (performance as any).navigation
    if (legacy && typeof legacy.type === 'number') return legacy.type === 1
  } catch {
    // ignore — treat as not a manual reload
  }
  return false
}

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

  /* ---- Same-domain navigation (SPA) ---- */
  private navCheckTimer: ReturnType<typeof setInterval> | null = null
  private lastUrl = ''

  // In-memory dedup: identical text is translated once per page/engine
  private transCache = new TranslationCache()
  // Texts currently being translated; concurrent duplicates share one request
  private inFlight = new Map<string, Promise<string>>()

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

    // Same-domain navigation auto-translates: the intent is kept in sessionStorage
    // (per-tab, temporary) because some same-tab navigations re-inject the content
    // script and would lose an in-memory-only flag.
    this.startNavigationListener()
    this.maybeAutoTranslate()
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
     Core: extract translatable paragraphs
     ============================================================ */
  /* ---- Convert candidate Element[] to Paragraph[] ---- */
  private elementsToParagraphs(elements: Element[]): Paragraph[] {
    const result: Paragraph[] = []
    const seen = new Set<Element>()
    const opts = { targetLang: this.targetLang }

    for (const el of elements) {
      if (seen.has(el)) continue
      seen.add(el)

      // All filtering rules live in ruleFilter (shared with the generic path)
      if (!passesFilters(el, opts)) continue

      const text = el.textContent?.trim() ?? ''
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
     Core: extract translatable paragraphs
     ============================================================ */
  extract(): Paragraph[] {
    this.setStatus('extracting')

    // 1. Check for site-specific rules first
    let result: Paragraph[]
    const siteRule = getSiteRule()
    if (siteRule) {
      result = this.elementsToParagraphs(extractWithSiteRule(siteRule))
    } else {
      // 2. Generic heuristic algorithm (pure rules in ruleFilter)
      const container = findMainContentContainer(document)
      const root = container || document.body
      const decisions = filterParagraphs(root, { targetLang: this.targetLang })
      result = []
      for (const d of decisions) {
        if (!d.extracted) continue
        result.push({
          id: uuid(),
          node: d.element,
          originalText: d.text,
          translatedText: '',
          lang: '',
          status: 'pending',
        })
      }
    }

    // Preserve records whose nodes are still attached to the document: some
    // same-domain URL changes (e.g. MDN's canonical redirect) rewrite the URL
    // without replacing the DOM — resetting the list would lose the records
    // and break in-place change detection. Detached records are dropped.
    const kept = this.paragraphs.filter((p) => p.node.isConnected)
    const keptNodes = new Set<Element>(kept.map((p) => p.node))
    this.paragraphs = kept.concat(result.filter((p) => !keptNodes.has(p.node)))

    this.totalCount = this.paragraphs.length
    this.processedCount = 0

    // Mark these nodes as processed (prevent re-extraction)
    this.paragraphs.forEach((p) => {
      p.node.setAttribute(ATTR.processed, 'true')
    })

    this.setStatus('idle')
    return this.paragraphs
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

    // Dedup cache is engine/language specific: drop it when identity changes
    this.transCache.ensureIdentity(`${resolvedEngine}|${this.targetLang}`)
    this.transCache.resetSaved()

    // Analytics: batch translation start
    this.sendAnalytic('pageTrans_start', {
      total: pending.length,
      targetLang: this.targetLang,
      engine,
      hostname: location.hostname,
    })

    // Batched concurrency
    const { batchSize, concurrency } = this.config
    // LLM engines use the huge context: chunk by paragraph count, not batchSize
    const chunkSize = engine?.startsWith('llm__')
      ? LLM_MAX_PARAGRAPHS
      : batchSize
    for (let i = 0; i < pending.length; i += chunkSize) {
      const batch = pending.slice(i, i + chunkSize)
      await this.translateBatch(batch, concurrency, engine)
      this.renderEngine.renderBatch(batch, this.config.displayMode, this.config.transStyle)
    }

    this.setStatus('translated')

    // Remember the "translated" intent so same-domain navigation auto-translates
    this.persistActive(true)

    // Start dynamic content observation
    this.startDynamicObserver()

    // Analytics: batch translation end
    const done = pending.filter((p) => p.status === 'done').length
    const failed = pending.filter((p) => p.status === 'error').length
    const duration = Date.now() - translateStartTime
    const dedupSaved = this.transCache.saved
    if (dedupSaved > 0) {
      console.debug(
        `[pageTrans] dedup saved ${dedupSaved}/${pending.length} translation calls`
      )
    }
    this.sendAnalytic('pageTrans_end', {
      // Page translation analysis
      success: `${done}/${pending.length}`,
      failed: `${failed}/${pending.length};${engine}`,
      duration: `${formatDuration(duration)};${pending.length};${engine}`,
      // Duplicate texts translated only once: saved/total
      saved: `${dedupSaved}/${pending.length}`,
      // Context
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
    // 1. Cache hits resolve immediately, no request needed
    const todo: Paragraph[] = []
    for (const para of batch) {
      const key = translationCacheKey(para.originalText)
      const cached = this.transCache.get(key)
      if (cached !== undefined) {
        this.transCache.noteSaved()
        this.finishParagraph(para, cached)
        continue
      }
      todo.push(para)
    }
    if (todo.length === 0) return

    // 2. Dedup identical texts within this batch: translate once, share result
    const firstByKey = new Map<string, Paragraph>()
    const dupByKey = new Map<string, Paragraph[]>()
    for (const para of todo) {
      const key = translationCacheKey(para.originalText)
      if (firstByKey.has(key)) {
        const list = dupByKey.get(key)
        if (list) list.push(para)
        else dupByKey.set(key, [para])
      } else {
        firstByKey.set(key, para)
      }
    }
    const uniques = [...firstByKey.values()]

    // 3. Group unique paragraphs into request units (count + total chars)
    const groups = this.buildRequestGroups(uniques, engine)

    // 4. Concurrent workers process groups
    const queue = [...groups]
    const workers: Promise<void>[] = []
    for (let i = 0; i < concurrency; i++) {
      workers.push(this.groupWorkerLoop(queue, engine))
    }
    await Promise.all(workers)

    // 5. Share translations with the deduped duplicates
    for (const [key, dupes] of dupByKey) {
      const first = firstByKey.get(key)!
      if (first.status !== 'done' || !first.translatedText) continue
      this.transCache.noteSaved() // duplicate texts translated only once
      for (const d of dupes) this.finishParagraph(d, first.translatedText)
    }
  }

  /**
   * Max total length budget for a joined batch request, kept below the
   * engine's maxLenght so the joined text passes the length check.
   */
  private engineBatchBudget(engine?: string): number {
    if (!engine) return 1600
    // LLM: moderate batch size — page translation renders results as each
    // batch completes, so oversized batches delay the visible progress
    // (generation is the bottleneck: ~1 token/char CJK ≈ 100s for 4k chars).
    if (engine.startsWith('llm__')) return 4096
    if (engine.startsWith('ggTrans')) return 4500 // google maxLenght 5000
    if (engine.startsWith('bing')) return 900 // bing truncates input beyond ~1000 chars per request
    return 1600 // baidu maxLenght 1800
  }

  /** Group paragraphs into request units: batchSize count + char budget. */
  private buildRequestGroups(
    paragraphs: Paragraph[],
    engine?: string
  ): Paragraph[][] {
    const budget = this.engineBatchBudget(engine)
    // LLM batches are budget-driven (huge context), not count-driven
    const maxCount = engine?.startsWith('llm__')
      ? LLM_MAX_PARAGRAPHS
      : this.config.batchSize
    const groups: Paragraph[][] = []
    let current: Paragraph[] = []
    let currentLen = 0
    for (const p of paragraphs) {
      const len = p.originalText.length + BATCH_SEP.length
      if (
        current.length > 0 &&
        (current.length >= maxCount || currentLen + len > budget)
      ) {
        groups.push(current)
        current = []
        currentLen = 0
      }
      current.push(p)
      currentLen += len
    }
    if (current.length > 0) groups.push(current)
    return groups
  }

  /** Mark a paragraph translated and report progress. */
  private finishParagraph(para: Paragraph, text: string): void {
    para.translatedText = text
    para.status = 'done'
    this.renderEngine.clearTranslating(para)
    this.processedCount++
    this.onProgress?.(this.processedCount, this.totalCount)
  }

  /* ---- Worker: pull request groups and translate them with retries ---- */
  private async groupWorkerLoop(
    queue: Paragraph[][],
    engine?: string
  ): Promise<void> {
    const maxRetries = 3

    while (queue.length > 0) {
      const group = queue.shift()!
      group.forEach((p) => {
        p.status = 'translating'
        this.renderEngine.markTranslating(p)
      })

      let retries = 0
      let done = false
      while (!done && retries <= maxRetries) {
        try {
          const results = await this.requestTranslateBatch(group, engine)
          group.forEach((p, i) => {
            const text = results[i]
            if (text) {
              this.transCache.set(translationCacheKey(p.originalText), text)
              this.finishParagraph(p, text)
            } else {
              // Engine returned an empty translation for this item
              p.status = 'error'
              p.error = 'empty result'
              this.renderEngine.clearTranslating(p)
            }
          })
          done = true
        } catch (e: any) {
          if (retries >= maxRetries) {
            group.forEach((p) => {
              p.status = 'error'
              p.error = e.message
              // Restore the original's appearance (no translation will render)
              this.renderEngine.clearTranslating(p)
            })
            done = true
          } else {
            retries++
            // Exponential backoff: 1s → 2s → 4s
            await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, retries - 1)))
          }
        }
      }

      // Count failed paragraphs toward progress (done ones counted by finishParagraph)
      group.forEach((p) => {
        if (p.status === 'error') {
          this.processedCount++
          this.onProgress?.(this.processedCount, this.totalCount)
        }
      })

      // Render this group's finished paragraphs right away — page translation
      // shows results progressively as each batch completes, not only when the
      // whole page is done (idempotent: renderOne updates existing nodes).
      this.renderEngine.renderBatch(
        group,
        this.config.displayMode,
        this.config.transStyle
      )
    }
  }

  /* ---- Call background translation (with in-memory dedup) ----
   * Single-paragraph path: used by tests and available for per-paragraph
   * features. Page translation itself goes through translateBatch (batch). */
  private callTranslate(para: Paragraph, engine?: string): Promise<string> {
    const key = translationCacheKey(para.originalText)

    // Already translated on this page with the same engine/language
    const cached = this.transCache.get(key)
    if (cached !== undefined) {
      this.transCache.noteSaved()
      return Promise.resolve(cached)
    }

    // Same text is already in flight — share the request
    const running = this.inFlight.get(key)
    if (running) {
      this.transCache.noteSaved()
      return running
    }

    const request = this.requestTranslate(para, engine)
      .then((text) => {
        this.transCache.set(key, text)
        return text
      })
      .finally(() => {
        this.inFlight.delete(key)
      })
    this.inFlight.set(key, request)
    return request
  }

  /* ---- Actually send the translation request to background ---- */
  private requestTranslate(para: Paragraph, engine?: string): Promise<string> {
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

  /* ---- Send one batch request: many paragraphs, one port message ---- */
  private requestTranslateBatch(
    group: Paragraph[],
    engine?: string
  ): Promise<string[]> {
    return new Promise((resolve, reject) => {
      if (!this.port) {
        reject(new Error('Port not connected'))
        return
      }

      const id = uuid()
      let settled = false

      // LLM batches can take minutes to generate (output-token bound); scale
      // the timeout with the total text length (~1 token/char for CJK).
      const isLLMEngine = !!engine && engine.startsWith('llm__')
      const totalChars = group.reduce((sum, p) => sum + p.originalText.length, 0)
      const timeoutMs = isLLMEngine
        ? Math.min(300000, 60000 + totalChars * 60)
        : Math.min(120000, 15000 + group.length * 2000)
      const timer = setTimeout(() => {
        if (settled) return
        settled = true
        this.port?.onMessage.removeListener(handler)
        reject(new Error('Translation timeout: ' + group[0]?.originalText.slice(0, 30)))
      }, timeoutMs)

      const handler = (msg: any) => {
        if (msg.id === id) {
          clearTimeout(timer)
          if (settled) return
          settled = true
          this.port?.onMessage.removeListener(handler)
          if (msg.error) reject(new Error(msg.error))
          else resolve(Array.isArray(msg.texts) ? msg.texts : [])
        }
      }

      this.port.onMessage.addListener(handler)
      this.port.postMessage({
        id,
        type: 'pageTransBatch',
        texts: group.map((p) => p.originalText),
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
      const container = findMainContentContainer(document)
      root = container || document.body
    }

    this.mutationObserver = new MutationObserver((mutations) => {
      // Only process new nodes in translated state
      if (this.status !== 'translated') return

      // React to added nodes AND in-place text changes (e.g. X "Show more"
      // expands tweet text by mutating existing spans, not adding new nodes)
      const hasContentChanges = mutations.some(
        (m) => m.addedNodes.length > 0 || m.type === 'characterData'
      )
      if (!hasContentChanges) return

      // Debounce: merge multiple changes within 500ms
      if (this.observerDebounceTimer) clearTimeout(this.observerDebounceTimer)
      this.observerDebounceTimer = setTimeout(() => {
        this.translateNewContent().catch(() => {})
      }, 500)
    })

    this.mutationObserver.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
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
    // Drop records whose nodes left the document (SPA feed churn), keeping
    // the list from growing unboundedly
    this.paragraphs = this.paragraphs.filter((p) => p.node.isConnected)

    const newParagraphs = this.extractNewParagraphs()
    // Paragraphs whose text changed after translation (X "Show more" expands
    // the tweet text inside the already-processed node, etc.) need a
    // re-translation of the same node
    const changedParagraphs = this.findChangedParagraphs()

    if (newParagraphs.length > 0) {
      this.paragraphs = this.paragraphs.concat(newParagraphs)
    }

    const pending = [...newParagraphs, ...changedParagraphs].filter(
      (p) => p.status === 'pending'
    )
    if (pending.length === 0) return

    // Translate in batches
    const { batchSize, concurrency } = this.config
    // LLM engines use the huge context: chunk by paragraph count, not batchSize
    const chunkSize = (this.currentEngine || '').startsWith('llm__')
      ? LLM_MAX_PARAGRAPHS
      : batchSize
    for (let i = 0; i < pending.length; i += chunkSize) {
      const batch = pending.slice(i, i + chunkSize)
      await this.translateBatch(batch, concurrency, this.currentEngine || undefined)
      this.renderEngine.renderBatch(batch, this.config.displayMode, this.config.transStyle)
    }
  }

  /**
   * Detect already-translated paragraphs whose DOM text changed after
   * translation (expanded/collapsed content, live text updates). The recorded
   * originalText is always synced to the current text so an un-translatable
   * change (e.g. the expanded text exceeds MAX_TEXT_LENGTH) doesn't cause
   * endless re-detection on every observer tick.
   */
  private findChangedParagraphs(): Paragraph[] {
    const changed: Paragraph[] = []
    for (const p of this.paragraphs) {
      // Only re-translate finished paragraphs still attached to the document
      if (p.status !== 'done' || !p.node.isConnected) continue
      const full = p.node.textContent?.trim() ?? ''
      if (!full || full === p.originalText) continue
      // For li/td/th the translation is appended INSIDE the original node, so
      // textContent includes the injected translation — re-read excluding it
      // (prevents "changed" false positives / re-translation loops)
      const current = getOriginalText(p.node)
      if (!current || current === p.originalText) continue
      // Sync the recorded text first (prevents re-detecting the same change)
      p.originalText = current
      // Skip re-translation if the new text no longer qualifies
      if (!shouldTranslateText(current, this.targetLang)) continue
      p.translatedText = ''
      p.status = 'pending'
      changed.push(p)
    }
    return changed
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
        if (visited.has(el)) continue
        visited.add(el)
        candidates.push(el)
      }
    } else {
      // Generic: same scope as the initial extraction, using the pure rules
      const container = findMainContentContainer(document)
      const decisions = filterParagraphs(container || document.body, {
        targetLang: this.targetLang,
      })
      for (const d of decisions) {
        if (!d.extracted || visited.has(d.element)) continue
        visited.add(d.element)
        candidates.push(d.element)
      }
    }

    for (const el of candidates) {
      // All filtering rules live in ruleFilter (shared with the generic path)
      if (!passesFilters(el, { targetLang: this.targetLang })) continue

      const text = el.textContent?.trim() ?? ''

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
    // Clear the auto-translate intent for this domain
    this.persistActive(false)
  }

  /* ============================================================
     Toggle translation/original
     ============================================================ */
  async toggle(engine?: string): Promise<void> {
    if (this.status === 'translating') return
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
    this.stopNavigationListener()
    this.paragraphs = []
    this.setStatus('idle')
  }

  /* ============================================================
     Auto-translate after same-domain navigation
     ============================================================ */

  /** Save/clear the "translated" intent for the current domain (tab-scoped sessionStorage) */
  private persistActive(active: boolean): void {
    try {
      if (active) {
        sessionStorage.setItem(
          PAGE_TRANS_ACTIVE_KEY,
          JSON.stringify({ hostname: location.hostname, ts: Date.now() })
        )
      } else {
        sessionStorage.removeItem(PAGE_TRANS_ACTIVE_KEY)
      }
    } catch {
      // ignore (sandboxed / opaque-origin pages may block storage)
    }
  }

  /** On (re-)injection: auto-translate if this domain was translated recently in this tab */
  private maybeAutoTranslate(): void {
    try {
      // A manual refresh (F5 / Ctrl+R / refresh button) resets the page
      // translation state: clear the intent and show the original page.
      // Same-domain SPA navigations are unaffected — they don't reload the
      // document and are handled by the navigation listener instead.
      if (isManualReload()) {
        this.persistActive(false)
        return
      }
      const raw = sessionStorage.getItem(PAGE_TRANS_ACTIVE_KEY)
      if (!raw) return
      const active = JSON.parse(raw) as { hostname: string; ts: number }
      if (this.destroyed) return
      if (!active || active.hostname !== location.hostname) return
      if (Date.now() - active.ts > AUTO_TRANSLATE_TTL) return
      this.extract()
      this.translate().catch(() => {})
    } catch {
      // ignore (sandboxed / opaque-origin pages may block storage)
    }
  }

  /** Watch for same-domain navigation (SPA pushState / popstate) */
  private startNavigationListener(): void {
    this.stopNavigationListener()
    this.lastUrl = location.href
    this.navCheckTimer = setInterval(() => {
      if (this.destroyed || location.href === this.lastUrl) return
      this.lastUrl = location.href
      this.handleUrlChange()
    }, 500)
  }

  private stopNavigationListener(): void {
    if (this.navCheckTimer) {
      clearInterval(this.navCheckTimer)
      this.navCheckTimer = null
    }
  }

  /** Re-translate after same-domain SPA navigation (only while translated) */
  private handleUrlChange(): void {
    if (this.status !== 'translated') return
    // The SPA may have replaced <main> entirely, so re-locate and re-observe
    // the container; this also catches content rendered after the URL change
    this.startDynamicObserver()
    // Extract + translate, retrying briefly to catch late-rendered content
    let attempts = 0
    const tryTranslate = (): void => {
      if (this.destroyed || this.status !== 'translated') return
      this.extract()
      this.translate().catch(() => {})
      attempts++
      if (attempts < 3) setTimeout(tryTranslate, 1500)
    }
    tryTranslate()
  }

  /* ============================================================
     Status management
     ============================================================ */
  private setStatus(status: EngineStatus): void {
    this.status = status
    this.onStatusChange?.(status)
  }
}
