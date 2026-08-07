/**
 * Unit tests for the "changed paragraph re-translation" logic added to
 * PageTransEngine (X "Show more" / expandable content fix).
 *
 * The engine method findChangedParagraphs() is private and tied to the DOM, so
 * these tests exercise the exact same algorithm against fake paragraph objects,
 * using the REAL shouldTranslateText from ruleFilter.ts.
 */

import { shouldTranslateText } from '@/content/pageTrans/ruleFilter'

/** Minimal node stub — only what findChangedParagraphs touches */
class FakeNode {
  text: string
  connected: boolean
  constructor(text: string, connected = true) {
    this.text = text
    this.connected = connected
  }
  get textContent(): string | null {
    return this.text
  }
  get isConnected(): boolean {
    return this.connected
  }
}

interface FakeParagraph {
  node: FakeNode
  originalText: string
  translatedText: string
  status: string
}

/** Exact copy of findChangedParagraphs() from pageTransEngine.ts */
function findChangedParagraphs(
  paragraphs: FakeParagraph[],
  targetLang: string
): FakeParagraph[] {
  const changed: FakeParagraph[] = []
  for (const p of paragraphs) {
    // Only re-translate finished paragraphs still attached to the document
    if (p.status !== 'done' || !p.node.isConnected) continue
    const current = p.node.textContent?.trim() ?? ''
    if (!current || current === p.originalText) continue
    // Sync the recorded text first (prevents re-detecting the same change)
    p.originalText = current
    // Skip re-translation if the new text no longer qualifies
    if (!shouldTranslateText(current, targetLang)) continue
    p.translatedText = ''
    p.status = 'pending'
    changed.push(p)
  }
  return changed
}

describe('findChangedParagraphs (X "Show more" fix)', () => {
  const tweetText = 'Funniest callout of the year from $VIAV on CPO timelines: "moving forward"'
  const expandedText =
    tweetText +
    ' They stated that Yes there is always issues, but the process is being improved. ' +
    'TLDR: Seeing CPO test revenues hit for $VIAV to $FORM around now. ' +
    'As for scale up timelines, early production should be H2 2027.'

  it('re-queues a paragraph whose text expanded in place (Show more)', () => {
    const p: FakeParagraph = {
      node: new FakeNode(tweetText),
      originalText: tweetText,
      translatedText: '（旧译文）',
      status: 'done',
    }
    // Simulate: X mutates the SAME node with the expanded text
    p.node.text = expandedText

    const changed = findChangedParagraphs([p], 'zh-CN')

    expect(changed).toHaveLength(1)
    expect(changed[0]).toBe(p)
    expect(p.status).toBe('pending')
    expect(p.translatedText).toBe('')
    expect(p.originalText).toBe(expandedText)
  })

  it('does not touch unchanged / error / detached paragraphs', () => {
    const stable: FakeParagraph = {
      node: new FakeNode('A stable tweet that never changes'),
      originalText: 'A stable tweet that never changes',
      translatedText: '稳定推文',
      status: 'done',
    }
    const failed: FakeParagraph = {
      node: new FakeNode('failed tweet'),
      originalText: 'failed tweet',
      translatedText: '',
      status: 'error',
    }
    const detached: FakeParagraph = {
      node: new FakeNode('old detached node'),
      originalText: 'old detached node',
      translatedText: '已卸载',
      status: 'done',
    }
    detached.node.connected = false

    const changed = findChangedParagraphs([stable, failed, detached], 'zh-CN')

    expect(changed).toHaveLength(0)
    expect(stable.status).toBe('done')
    expect(failed.status).toBe('error')
    expect(detached.status).toBe('done')
  })

  it('does not re-detect the same change on a second pass (no loop)', () => {
    const p: FakeParagraph = {
      node: new FakeNode(tweetText),
      originalText: tweetText,
      translatedText: '旧译文',
      status: 'done',
    }
    p.node.text = expandedText
    findChangedParagraphs([p], 'zh-CN')

    // originalText is now synced — a second observer tick must find nothing
    const second = findChangedParagraphs([p], 'zh-CN')
    expect(second).toHaveLength(0)
  })

  it('syncs originalText even when the new text is not translatable (no retry loop)', () => {
    const tooLong: FakeParagraph = {
      node: new FakeNode('short'),
      originalText: 'short',
      translatedText: '短',
      status: 'done',
    }
    tooLong.node.text = 'a'.repeat(6000) // > MAX_TEXT_LENGTH (5000)

    const changed = findChangedParagraphs([tooLong], 'zh-CN')

    expect(changed).toHaveLength(0)
    expect(tooLong.originalText).toBe('a'.repeat(6000))
    expect(tooLong.status).toBe('done')
  })

  it('does not re-translate text already in the target language, but still syncs', () => {
    const pZh: FakeParagraph = {
      node: new FakeNode('initial english'),
      originalText: 'initial english',
      translatedText: '初始翻译',
      status: 'done',
    }
    pZh.node.text = '这条推文现在变成了中文内容所以不需要翻译'

    const changed = findChangedParagraphs([pZh], 'zh-CN')

    expect(changed).toHaveLength(0)
    expect(pZh.originalText).toBe(pZh.node.text)
    expect(pZh.status).toBe('done')
  })
})
