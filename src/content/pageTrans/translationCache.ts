/**
 * In-memory translation cache with LRU eviction.
 *
 * Page translation often meets the same text many times on one page
 * (forum signatures, repeated post titles, pagination / infinite-scroll
 * feeds). This cache dedupes translations within the current page:
 *
 * - lifetime: page session only (cleared on refresh because the content
 *   script is recreated)
 * - identity: cleared whenever the engine or target language changes
 * - eviction: LRU with a hard cap, since infinite-scroll pages keep
 *   adding new unique text without a reload
 */

export const TRANSLATION_CACHE_LIMIT = 2000

/**
 * Normalize text into a cache key.
 *
 * Whitespace is collapsed (the same visible sentence often carries
 * different line breaks/indentation in different DOM positions), but
 * case is preserved — casing differences can be meaningful and a wrong
 * merge would render one translation onto two different texts.
 */
export function translationCacheKey(text: string): string {
  return text.trim().replace(/\s+/g, ' ')
}

export class TranslationCache {
  private cache = new Map<string, string>()
  private identity = ''
  private savedCount = 0

  constructor(private limit: number = TRANSLATION_CACHE_LIMIT) {}

  /**
   * Bind the cache to an `engine|targetLang` identity. When the identity
   * changes (user switched engine / language), all entries are dropped so
   * stale translations can never leak into a new configuration.
   */
  ensureIdentity(identity: string): void {
    if (identity === this.identity) return
    this.cache.clear()
    this.identity = identity
    this.savedCount = 0
  }

  /** LRU lookup: a hit is moved to the newest position. */
  get(key: string): string | undefined {
    const value = this.cache.get(key)
    if (value === undefined) return undefined
    this.cache.delete(key)
    this.cache.set(key, value)
    return value
  }

  has(key: string): boolean {
    return this.cache.has(key)
  }

  /** LRU insert: evicts the least-recently-used entries over the cap. */
  set(key: string, value: string): void {
    if (this.cache.has(key)) this.cache.delete(key)
    this.cache.set(key, value)
    while (this.cache.size > this.limit) {
      const oldest = this.cache.keys().next().value
      if (oldest === undefined) break
      this.cache.delete(oldest)
    }
  }

  /** Count one avoided API call (cache hit or in-flight join). */
  noteSaved(): void {
    this.savedCount++
  }

  /** Avoided API calls since the last reset. */
  get saved(): number {
    return this.savedCount
  }

  resetSaved(): void {
    this.savedCount = 0
  }

  get size(): number {
    return this.cache.size
  }

  clear(): void {
    this.cache.clear()
    this.savedCount = 0
  }
}
