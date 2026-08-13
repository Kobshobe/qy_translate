/**
 * Bing long-text chunking: text beyond BING_MAX_REQ_TEXT must be split into
 * per-request chunks (Bing truncates input beyond ~1000 chars) and rejoined
 * losslessly, so the full text is translated.
 */

import splitLongText from '@/translator/splitLongText'
import { BING_MAX_REQ_TEXT, BING_SPLIT_PUNCT } from '@/translator/bingTrans'

describe('Bing long-text chunking', () => {
  it('splits long English text into <=1000-char chunks, losslessly joinable', () => {
    const text = Array.from({ length: 2500 }, (_, i) => 'word' + (i % 10)).join(' ')
    const chunks = splitLongText(text, { maxLength: BING_MAX_REQ_TEXT })
    expect(chunks.length).toBeGreaterThan(1)
    expect(chunks.every((c) => c.length <= BING_MAX_REQ_TEXT)).toBe(true)
    expect(chunks.join('')).toBe(text)
  })

  it('splits long Chinese text (no spaces) at CJK punctuation', () => {
    const text = '机器学习是人工智能的一个分支。它通过数据训练模型。模型可以用于预测和分类。'.repeat(50)
    const chunks = splitLongText(text, {
      maxLength: BING_MAX_REQ_TEXT,
      splitPunct: BING_SPLIT_PUNCT,
    })
    expect(chunks.length).toBeGreaterThan(1)
    expect(chunks.every((c) => c.length <= BING_MAX_REQ_TEXT)).toBe(true)
    expect(chunks.join('')).toBe(text)
  })

  it('splits mixed EN + CJK text losslessly', () => {
    const text = 'Hello world. 你好，世界！这是一个测试。'.repeat(80)
    const chunks = splitLongText(text, {
      maxLength: BING_MAX_REQ_TEXT,
      splitPunct: BING_SPLIT_PUNCT,
    })
    expect(chunks.every((c) => c.length <= BING_MAX_REQ_TEXT)).toBe(true)
    expect(chunks.join('')).toBe(text)
  })

  it('throws on an unbreakable run (handled by hard-slice fallback in transChunks)', () => {
    const text = '中'.repeat(BING_MAX_REQ_TEXT + 10)
    expect(() => splitLongText(text, { maxLength: BING_MAX_REQ_TEXT })).toThrow()
  })

  it('keeps short text as a single chunk', () => {
    const text = 'short text that fits'
    const chunks = splitLongText(text, { maxLength: BING_MAX_REQ_TEXT })
    expect(chunks).toEqual([text])
  })
})
