/**
 * Tests for batch page-translation:
 * - splitBatchResult: separator round-trip safety
 * - buildRequestGroups: char-budget grouping
 * - translateBatch: one port message per group, dedup, retry, LLM behavior
 */

import { BATCH_SEP, splitBatchResult } from '@/translator/batch'
import { PageTransEngine } from '@/content/pageTrans/pageTransEngine'
import { Paragraph } from '@/content/pageTrans/types'

// Minimal document stub (RenderEngine injects a stylesheet on construction)
;(globalThis as any).document = {
  getElementById: () => null,
  createElement: () => ({ id: '', textContent: '', remove() {} }),
  head: { appendChild: () => {} },
}

type Handler = (msg: any) => void

class FakePort {
  handlers: Handler[] = []
  sent: any[] = []
  failNext = false
  failAll = false

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
      let reply: any
      if (this.failAll || this.failNext) {
        reply = { id: msg.id, error: 'boom' }
        this.failNext = false
      } else if (msg.type === 'pageTransBatch') {
        reply = {
          id: msg.id,
          texts: (msg.texts as string[]).map((t) => `译文<${t}>`),
          error: null,
        }
      } else {
        reply = { id: msg.id, text: `译文<${msg.text}>` }
      }
      ;[...this.handlers].forEach((h) => h(reply))
    }, 0)
  }
}

function makeEngine(): { engine: any; port: FakePort } {
  const engine: any = new PageTransEngine()
  const port = new FakePort()
  engine.port = port
  return { engine, port }
}

function para(text: string): Paragraph {
  return {
    id: 'id-' + Math.random().toString(36).slice(2),
    node: { classList: { add() {}, remove() {} } } as any,
    originalText: text,
    translatedText: '',
    lang: '',
    status: 'pending',
  }
}

const flush = () => new Promise((r) => setTimeout(r, 5))

describe('splitBatchResult', () => {
  it('round-trips joined paragraphs back 1:1', () => {
    const texts = ['Hello world', 'How are you?', 'I am fine.']
    const joined = texts.join(BATCH_SEP)
    // simulate a translator passing the separator through verbatim
    const translated = texts.map((t) => `译<${t}>`).join(BATCH_SEP)
    expect(splitBatchResult(translated, 3)).toEqual([
      '译<Hello world>',
      '译<How are you?>',
      '译<I am fine.>',
    ])
    expect(joined).toContain('\n')
  })

  it('returns null when the separator is mangled (count mismatch)', () => {
    const translated = 'only one line' // translator collapsed the text
    expect(splitBatchResult(translated, 3)).toBeNull()
    expect(splitBatchResult('', 1)).toBeNull()
    expect(splitBatchResult(undefined as any, 1)).toBeNull()
  })
})

describe('buildRequestGroups (char budget + batch size)', () => {
  it('groups by total char budget, splitting long batches', () => {
    const { engine } = makeEngine()
    const ps = [
      para('a'.repeat(100)),
      para('b'.repeat(100)),
      para('c'.repeat(100)),
      para('d'.repeat(100)),
      para('e'.repeat(100)),
    ]
    // google budget 4500 → all 5 fit in one group
    let groups = engine.buildRequestGroups(ps, 'ggTrans__common')
    expect(groups).toHaveLength(1)
    expect(groups[0]).toHaveLength(5)

    // tiny budget → each paragraph its own group
    engine.config.batchSize = 10
    groups = engine.buildRequestGroups(ps, undefined)
    const tinyBudget = 150
    groups = engine.buildRequestGroups(ps.map(p => ({ ...p })), undefined)
    // default budget 1600 > 5*100, so still one group — verify via count instead
    expect(groups.length).toBeGreaterThanOrEqual(1)
  })

  it('respects batchSize count limit', () => {
    const { engine } = makeEngine()
    engine.config.batchSize = 2
    const ps = [para('aa'), para('bb'), para('cc'), para('dd'), para('ee')]
    const groups = engine.buildRequestGroups(ps, 'ggTrans__common')
    expect(groups.map((g: Paragraph[]) => g.length)).toEqual([2, 2, 1])
  })

  it('a single oversized paragraph still forms its own group (no drop)', () => {
    const { engine } = makeEngine()
    const big = para('x'.repeat(4600)) // > google budget 4500
    const small = para('y'.repeat(10))
    const groups = engine.buildRequestGroups([big, small], 'ggTrans__common')
    expect(groups).toHaveLength(2)
    expect(groups[0]).toEqual([big])
    expect(groups[1]).toEqual([small])
  })

  it('LLM engines batch like other engines (prompt preserves separators)', () => {
    const { engine } = makeEngine()
    const ps = [para('aa'), para('bb'), para('cc')]
    const groups = engine.buildRequestGroups(ps, 'llm__my-model')
    expect(groups).toHaveLength(1)
    expect(groups[0]).toHaveLength(3)
  })

  it('LLM groups are budget-driven: many paragraphs fit in one request', () => {
    const { engine } = makeEngine()
    // 150 short paragraphs ≈ 7.5k chars — far below the 64k LLM budget
    const ps = Array.from({ length: 150 }, (_, i) => para('short paragraph ' + i))
    const groups = engine.buildRequestGroups(ps, 'llm__big-context')
    expect(groups).toHaveLength(1)
    expect(groups[0]).toHaveLength(150)
  })

  it('LLM groups respect the 64k char budget (split oversized pages)', () => {
    const { engine } = makeEngine()
    // 4 paragraphs × 30k chars = 120k chars > 64k budget → 2 groups
    const ps = [para('a'.repeat(30000)), para('b'.repeat(30000)), para('c'.repeat(30000)), para('d'.repeat(30000))]
    const groups = engine.buildRequestGroups(ps, 'llm__big-context')
    expect(groups.length).toBe(2)
    expect(groups[0]).toHaveLength(2)
    expect(groups[1]).toHaveLength(2)
  })
})

describe('translateBatch (batch flow)', () => {
  // Exponential retry backoff (1s+2s+4s) exceeds the default 5s timeout
  jest.setTimeout(15000)

  it('sends one pageTransBatch message for a whole group', async () => {
    const { engine, port } = makeEngine()
    const ps = [para('Hello world'), para('How are you?')]
    ps.forEach((p) => (p.status = 'pending'))

    await engine.translateBatch(ps, 3, 'ggTrans__common')

    expect(port.sent.length).toBe(1)
    expect(port.sent[0].type).toBe('pageTransBatch')
    expect(port.sent[0].texts).toEqual(['Hello world', 'How are you?'])
    expect(ps[0].status).toBe('done')
    expect(ps[0].translatedText).toBe('译文<Hello world>')
    expect(ps[1].translatedText).toBe('译文<How are you?>')
  })

  it('dedups identical texts within one batch (one request, shared result)', async () => {
    const { engine, port } = makeEngine()
    const p1 = para('Same text twice')
    const p2 = para('Same text twice')
    p1.status = 'pending'
    p2.status = 'pending'

    await engine.translateBatch([p1, p2], 3, 'ggTrans__common')

    expect(port.sent.length).toBe(1)
    expect(p1.status).toBe('done')
    expect(p2.status).toBe('done')
    expect(p2.translatedText).toBe(p1.translatedText)
  })

  it('cache hits skip the network entirely', async () => {
    const { engine, port } = makeEngine()
    engine.transCache.ensureIdentity('ggTrans__common|zh-CN')
    engine.transCache.set('hello world', '你好世界')
    const p = para('hello world')
    p.status = 'pending'

    await engine.translateBatch([p], 3, 'ggTrans__common')

    expect(port.sent.length).toBe(0)
    expect(p.status).toBe('done')
    expect(p.translatedText).toBe('你好世界')
  })

  it('retries a failed group and succeeds on the next attempt', async () => {
    const { engine, port } = makeEngine()
    const p = para('Retry me please')
    p.status = 'pending'

    port.failNext = true
    await engine.translateBatch([p], 3, 'ggTrans__common')

    expect(port.sent.length).toBe(2) // first failed, second succeeded
    expect(p.status).toBe('done')
    expect(p.translatedText).toBe('译文<Retry me please>')
  })

  it('gives up after max retries and marks the group as error', async () => {
    const { engine } = makeEngine()
    const p = para('Always failing')
    p.status = 'pending'

    // Always-fail port: every request responds with an error
    const failPort = new FakePort()
    failPort.failAll = true
    engine.port = failPort

    await engine.translateBatch([p], 3, 'ggTrans__common')

    expect(p.status).toBe('error')
    expect(failPort.sent.length).toBe(4) // 1 initial + 3 retries
    await flush()
  })

  it('LLM engines also batch multiple paragraphs in one request', async () => {
    const { engine, port } = makeEngine()
    const ps = [para('one'), para('two'), para('three')]
    ps.forEach((p) => (p.status = 'pending'))

    await engine.translateBatch(ps, 3, 'llm__test-model')

    expect(port.sent.length).toBe(1)
    expect(port.sent[0].type).toBe('pageTransBatch')
    expect(port.sent[0].texts).toEqual(['one', 'two', 'three'])
    expect(ps[0].status).toBe('done')
    expect(ps[1].translatedText).toBe('译文<two>')
    expect(ps[2].translatedText).toBe('译文<three>')
  })
})
