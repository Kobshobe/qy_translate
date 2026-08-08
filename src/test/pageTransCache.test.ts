import {
  TranslationCache,
  translationCacheKey,
  TRANSLATION_CACHE_LIMIT,
} from '../content/pageTrans/translationCache'

describe('translationCacheKey', () => {
  it('collapses runs of whitespace and trims', () => {
    expect(translationCacheKey('  hello\n\t world  ')).toBe('hello world')
    expect(translationCacheKey('a\r\n\r\nb    c')).toBe('a b c')
  })

  it('is case sensitive (no wrong merges)', () => {
    expect(translationCacheKey('Re: Title')).not.toBe(
      translationCacheKey('re: title')
    )
  })
})

describe('TranslationCache', () => {
  it('stores and retrieves translations', () => {
    const cache = new TranslationCache()
    cache.set('a', '甲')
    expect(cache.get('a')).toBe('甲')
    expect(cache.get('missing')).toBeUndefined()
  })

  it('clears everything when identity changes', () => {
    const cache = new TranslationCache()
    cache.ensureIdentity('google|zh-CN')
    cache.set('a', '甲')
    cache.noteSaved()

    cache.ensureIdentity('google|zh-CN') // same identity: keep
    expect(cache.get('a')).toBe('甲')
    expect(cache.saved).toBe(1)

    cache.ensureIdentity('deepl|zh-CN') // engine switch: drop
    expect(cache.get('a')).toBeUndefined()
    expect(cache.size).toBe(0)
    expect(cache.saved).toBe(0)
  })

  it('counts avoided API calls and resets them', () => {
    const cache = new TranslationCache()
    cache.noteSaved()
    cache.noteSaved()
    expect(cache.saved).toBe(2)
    cache.resetSaved()
    expect(cache.saved).toBe(0)
  })

  it('evicts the least recently used entry over the cap', () => {
    const cache = new TranslationCache(3)
    cache.set('a', '1')
    cache.set('b', '2')
    cache.set('c', '3')
    cache.set('d', '4') // evicts 'a'
    expect(cache.get('a')).toBeUndefined()
    expect(cache.size).toBe(3)
    expect(cache.get('b')).toBe('2')
    expect(cache.get('c')).toBe('3')
    expect(cache.get('d')).toBe('4')
  })

  it('get() refreshes recency so hot entries survive eviction', () => {
    const cache = new TranslationCache(3)
    cache.set('a', '1')
    cache.set('b', '2')
    cache.set('c', '3')
    cache.get('a') // 'a' is now newest, 'b' becomes oldest
    cache.set('d', '4') // evicts 'b', not 'a'
    expect(cache.get('a')).toBe('1')
    expect(cache.get('b')).toBeUndefined()
  })

  it('set() of an existing key does not grow the cache', () => {
    const cache = new TranslationCache(2)
    cache.set('a', '1')
    cache.set('b', '2')
    cache.set('a', 'one')
    expect(cache.size).toBe(2)
    expect(cache.get('a')).toBe('one')
    expect(cache.get('b')).toBe('2')
  })

  it('default limit guards infinite-scroll pages', () => {
    const cache = new TranslationCache()
    expect(TRANSLATION_CACHE_LIMIT).toBe(2000)
    for (let i = 0; i < TRANSLATION_CACHE_LIMIT + 50; i++) {
      cache.set(`k${i}`, `v${i}`)
    }
    expect(cache.size).toBe(TRANSLATION_CACHE_LIMIT)
    // oldest entries evicted, newest kept
    expect(cache.has('k0')).toBe(false)
    expect(cache.has(`k${TRANSLATION_CACHE_LIMIT + 49}`)).toBe(true)
  })
})
