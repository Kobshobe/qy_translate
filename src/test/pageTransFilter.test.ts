/**
 * @jest-environment jsdom
 */
// Golden tests: every built-in fixture must extract exactly its
// expectedExtracted texts (in extraction order).
import { ALL_FIXTURES } from '@/content/pageTrans/fixtures'
import {
  filterParagraphs,
  findMainContentContainer,
} from '@/content/pageTrans/ruleFilter'

beforeAll(() => {
  // jsdom has no layout engine: report every element as 100x100 (visible)
  // unless it is explicitly hidden, so the visibility checks behave like a browser.
  Element.prototype.getBoundingClientRect = function () {
    const style = window.getComputedStyle(this)
    if (style.display === 'none' || style.visibility === 'hidden') {
      return { x: 0, y: 0, top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 } as DOMRect
    }
    return { x: 0, y: 0, top: 0, left: 0, right: 0, bottom: 0, width: 100, height: 100 } as DOMRect
  }
})

describe.each(ALL_FIXTURES.map((f) => [f.id, f] as [string, (typeof ALL_FIXTURES)[number]]))(
  '%s',
  (_id, fixture) => {
    test('golden: extracted texts match expectation', () => {
      const expected = fixture.expectedExtracted
      if (!expected) {
        throw new Error(`Fixture "${fixture.id}" has no expectedExtracted yet`)
      }
      document.body.innerHTML = `<div id="fixture">${fixture.html}</div>`
      const root = document.getElementById('fixture')!
      const container = findMainContentContainer(root)
      const decisions = filterParagraphs(container || root, {
        targetLang: fixture.targetLang || 'zh-CN',
      })
      const extracted = decisions.filter((d) => d.extracted).map((d) => d.text)
      expect(extracted).toEqual(expected)
    })
  }
)
