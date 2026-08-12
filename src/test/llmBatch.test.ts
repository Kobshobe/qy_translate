/**
 * Tests for LLM batch-translation prompt: when the request contains the batch
 * separator, the system prompt must instruct the model to preserve the
 * markers so the response splits back 1:1 per paragraph.
 */

import { LLMTrans } from '@/translator/llmTrans'
import { BATCH_SEP } from '@/translator/batch'

describe('LLMTrans batch system prompt', () => {
  const t: any = new LLMTrans()

  it('omits the batch rule for ordinary single-segment translations', () => {
    const prompt = t.buildSystemPrompt('English', 'Chinese')
    expect(prompt).toContain('Translate the following text from English to Chinese')
    expect(prompt).not.toContain(BATCH_SEP)
    expect(prompt).not.toContain('segments separated')
  })

  it('instructs the model to preserve separators in batch mode', () => {
    const prompt = t.buildSystemPrompt('English', 'Chinese', undefined, true)
    expect(prompt).toContain(BATCH_SEP)
    expect(prompt).toMatch(/keep the markers exactly as-is/i)
    expect(prompt).toMatch(/preserving the number and order/i)
  })

  it('keeps the custom prompt appended after the batch rule', () => {
    const prompt = t.buildSystemPrompt('English', 'Chinese', 'Be formal and concise.', true)
    expect(prompt.indexOf(BATCH_SEP)).toBeGreaterThan(-1)
    expect(prompt.indexOf('Be formal and concise.')).toBeGreaterThan(prompt.indexOf(BATCH_SEP))
  })
})
