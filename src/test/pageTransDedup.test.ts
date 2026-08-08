/**
 * Engine-level tests for the in-memory translation dedup cache.
 *
 * A fake port stands in for the background connection: it counts how many
 * translation requests actually go out and answers them asynchronously.
 */

import { PageTransEngine } from '@/content/pageTrans/pageTransEngine'

// Minimal document stub: RenderEngine injects its stylesheet on
// construction (real pages provide document; jest has no jsdom here).
;(globalThis as any).document = {
  getElementById: () => null,
  createElement: () => ({ id: '', textContent: '', remove() {} }),
  head: { appendChild: () => {} },
}

type Handler = (msg: any) => void

class FakePort {
  handlers: Handler[] = []
  sent: any[] = []
  /** Respond with an error instead of a translation */
  failNext = false

  onMessage = {
    addListener: (h: Handler) => {
      this.handlers.push(h)
    },
    removeListener: (h: Handler) => {
      this.handlers = this.handlers.filter((x) => x !== h)
    },
  }

  postMessage(msg: any): void {
    this.sent.push(msg)
    setTimeout(() => {
      const reply = this.failNext
        ? { id: msg.id, error: 'boom' }
        : { id: msg.id, text: `译文<${msg.text}>` }
      this.failNext = false
      ;[...this.handlers].forEach((h) => h(reply))
    }, 0)
  }
}

function makeEngine() {
  const engine: any = new PageTransEngine()
  const port = new FakePort()
  engine.port = port
  return { engine, port }
}

function para(text: string): any {
  return { originalText: text }
}

const flush = () => new Promise((r) => setTimeout(r, 5))

describe('pageTrans translation dedup', () => {
  it('translates identical texts only once', async () => {
    const { engine, port } = makeEngine()
    const p1 = para('Guten Tag zusammen')
    const p2 = para('Guten Tag zusammen')

    const [t1, t2] = await Promise.all([
      engine.callTranslate(p1, 'google'),
      engine.callTranslate(p2, 'google'),
    ])

    expect(port.sent.length).toBe(1) // one request for both
    expect(t1).toBe('译文<Guten Tag zusammen>')
    expect(t2).toBe(t1)
    expect(engine.transCache.saved).toBe(1) // second call avoided an API hit
  })

  it('dedups across whitespace differences but not case differences', async () => {
    const { engine, port } = makeEngine()

    await engine.callTranslate(para('hello   world'), 'google')
    await engine.callTranslate(para('hello\nworld'), 'google') // same key
    expect(port.sent.length).toBe(1)

    await engine.callTranslate(para('Hello World'), 'google') // different case
    expect(port.sent.length).toBe(2)
  })

  it('a second pass hits the cache (no new request)', async () => {
    const { engine, port } = makeEngine()

    await engine.callTranslate(para('Signatur Text'), 'google')
    const again = await engine.callTranslate(para('Signatur Text'), 'google')

    expect(port.sent.length).toBe(1)
    expect(again).toBe('译文<Signatur Text>')
  })

  it('clears the cache when engine/language identity changes', async () => {
    const { engine, port } = makeEngine()

    engine.transCache.ensureIdentity('google|zh-CN')
    await engine.callTranslate(para('Hallo'), 'google')
    expect(port.sent.length).toBe(1)

    // same identity: cache still valid
    engine.transCache.ensureIdentity('google|zh-CN')
    await engine.callTranslate(para('Hallo'), 'google')
    expect(port.sent.length).toBe(1)

    // user switched engine: must re-translate
    engine.transCache.ensureIdentity('deepl|zh-CN')
    await engine.callTranslate(para('Hallo'), 'deepl')
    expect(port.sent.length).toBe(2)
  })

  it('does not cache failures; retry translates again', async () => {
    const { engine, port } = makeEngine()

    port.failNext = true
    await expect(engine.callTranslate(para('kaputt'), 'google')).rejects.toThrow(
      'boom'
    )
    expect(engine.transCache.size).toBe(0)

    const ok = await engine.callTranslate(para('kaputt'), 'google')
    expect(port.sent.length).toBe(2) // failure was not cached
    expect(ok).toBe('译文<kaputt>')
  })

  it('concurrent duplicates share the in-flight request, then cache serves later calls', async () => {
    const { engine, port } = makeEngine()
    const text = 'Immer wieder derselbe Satz im Forum'

    const results = await Promise.all([
      engine.callTranslate(para(text), 'google'),
      engine.callTranslate(para(text), 'google'),
      engine.callTranslate(para(text), 'google'),
    ])

    expect(port.sent.length).toBe(1)
    expect(new Set(results).size).toBe(1)

    await engine.callTranslate(para(text), 'google')
    expect(port.sent.length).toBe(1) // cached now
    await flush()
  })
})
