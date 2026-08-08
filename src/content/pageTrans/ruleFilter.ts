/**
 * ruleFilter — Pure, instrumented page-translation filtering rules
 *
 * The generic heuristic filtering rules were extracted from PageTransEngine so
 * the same logic can be:
 *   1. run by the engine (behavior-preserving)
 *   2. run by the Rule Lab (options page) against fixture HTML
 *   3. asserted by jest golden tests
 *
 * All functions take an explicit root and never touch globals
 * (document / location / chrome APIs).
 */

import { isTargetLangText } from '@/translator/trans_base'
import { ATTR } from './types'

/* ============================================================
   Constants
   ============================================================ */

/** Translatable target tags (block-level text elements) */
export const TARGET_TAGS = new Set([
  'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'li', 'td', 'th', 'blockquote', 'figcaption',
  'dt', 'dd', 'caption',
  // <summary>: visible title of a <details> collapsible (FAQ accordions etc.)
  'summary',
  // Modern card/feed UIs often render titles in <a> (e.g. Reddit's a[slot=title])
  'a',
])

/** Tags excluded from translation */
export const SKIP_TAGS = new Set([
  'script', 'style', 'noscript', 'code', 'pre',
  'svg', 'math', 'canvas', 'video', 'audio',
  'textarea', 'select', 'option',
])

/** ARIA roles excluded from translation */
export const SKIP_ROLES = new Set([
  'navigation', 'banner', 'complementary', 'contentinfo',
  'alert', 'dialog', 'toolbar', 'menu', 'menubar',
  'tabpanel', 'presentation',
])

export const MIN_TEXT_LENGTH = 2
export const MAX_TEXT_LENGTH = 5000

/** Bare-text <div> candidate threshold (avoid timestamps/badges/button labels) */
export const MIN_DIV_TEXT_LENGTH = 30

/**
 * Inline content tags that may appear inside a text div without turning it
 * into a layout container: line breaks, embedded images (smilies/photos),
 * links and inline text markup.
 */
const INLINE_TEXT_TAGS = new Set([
  'br', 'img', 'a', 'span', 'em', 'strong', 'b', 'i', 'u', 's',
  'small', 'sub', 'sup', 'time', 'abbr',
])

/**
 * A div is treated as a bare text container when it has no element children,
 * or its children are all inline-level content. Classic forum/blog layouts
 * (phpBB, vBulletin, …) render multi-line post text as raw text nodes
 * separated by <br> with smilies/embedded images inline; block children
 * (div/p/ul/table/…) mark layout frames instead.
 */
function isBareTextDiv(el: Element): boolean {
  if (el.children.length === 0) return true
  for (const child of el.children) {
    if (!INLINE_TEXT_TAGS.has(child.tagName.toLowerCase())) return false
  }
  return true
}

/** Combined non-content selectors (single closest() match) */
export const NON_CONTENT_SELECTOR = [
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

/** Structural boundaries: content past a boundary is an independent text unit */
const STRUCTURAL = new Set(['table', 'ul', 'ol', 'dl'])

/* ============================================================
   Reason types
   ============================================================ */

export type FilterReason =
  | 'extracted'
  | 'non-content-area'      // inside nav/sidebar/footer or link-density nav
  | 'already-processed'     // has data-qyt-processed / translation markers
  | 'skip-tag'              // script/style/code/pre/... tag
  | 'skip-role'             // excluded ARIA role (self or ancestor)
  | 'not-visible'           // display:none / visibility:hidden / zero-size / aria-hidden
  | 'text-too-short'        // below MIN_TEXT_LENGTH (bare divs: below MIN_DIV_TEXT_LENGTH)
  | 'text-too-long'         // above MAX_TEXT_LENGTH
  | 'digits-or-symbols'     // pure digits / punctuation / whitespace
  | 'url-only'              // pure http(s) URL
  | 'target-lang'           // already in the target language
  | 'layout-container'      // directly wraps table/ul/ol/dl (not a text unit)
  | 'duplicate-of-ancestor' // nested inside another translatable target tag

export interface FilterDecision {
  element: Element
  tag: string
  text: string
  extracted: boolean
  reason: FilterReason
}

export interface FilterOptions {
  /** Target language, used by the target-lang check ('' = auto, never skip) */
  targetLang: string
}

/* ============================================================
   Shared predicates
   ============================================================ */

/** Whether the element is in a non-content area (nav, sidebar, footer, ...) */
export function isInNonContentArea(el: Element): boolean {
  // Layer 1: combined selector single match
  if (el.closest(NON_CONTENT_SELECTOR)) return true

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

  // A long link (e.g. an article/post title) means it's content, not nav
  return linkRatio > 0.5 && avgLinkLen < 25 && maxLinkLen < 20
}

/** Whether the element is visible on the page */
export function isElementVisible(el: Element): boolean {
  // 1. Computed style — checked unconditionally: display:none, visibility:hidden
  //    and opacity:0 make an element invisible even though it may still occupy
  //    layout space (visibility/opacity keep offsetParent non-null).
  const style = window.getComputedStyle(el)
  if (style.display === 'none') return false
  if (style.visibility === 'hidden' || style.visibility === 'collapse') return false
  if (parseFloat(style.opacity) < 0.01) return false

  // 2. Check element size is non-zero (offsetParent null is not a reliable
  //    invisibility signal — fixed elements have no offsetParent)
  const rect = el.getBoundingClientRect()
  if (rect.width === 0 || rect.height === 0) return false

  // 3. Check element or ancestors for aria-hidden
  if (el.closest('[aria-hidden="true"]')) return false

  return true
}

/** Whether a paragraph is worth translating */
export function shouldTranslateText(text: string, targetLang: string): boolean {
  if (text.length < MIN_TEXT_LENGTH) return false
  if (text.length > MAX_TEXT_LENGTH) return false
  // Exclude pure digits/symbols/whitespace (Unicode punctuation covers all languages)
  if (/^[\d\s\p{P}]+$/u.test(text)) return false
  // Exclude pure URLs (link-post/source-link text should not be translated)
  if (/^https?:\/\/\S+$/i.test(text)) return false
  // If target lang isn't auto and the text is already in the target lang, skip
  if (targetLang !== 'auto' && isTargetLangText(text, targetLang)) {
    return false
  }
  return true
}

/* ============================================================
   Text helpers
   ============================================================ */

/**
 * Text content of a node EXCLUDING injected translation nodes.
 * For li/td/th the translation is appended INSIDE the original node, so a
 * plain textContent read returns "original + translation" — use this when
 * comparing a translated node's current text against the recorded original.
 */
export function getOriginalText(el: Element): string {
  if (!el.querySelector(`[${ATTR.translation}]`)) {
    return el.textContent?.trim() ?? ''
  }
  const clone = el.cloneNode(true) as Element
  clone.querySelectorAll(`[${ATTR.translation}]`).forEach((n) => n.remove())
  return clone.textContent?.trim() ?? ''
}

/* ============================================================
   Main content container lookup strategy
   ============================================================ */

/** Whether the element contains enough body content (avoid treating cards/list items as page containers) */
function isContentRichContainer(el: Element): boolean {
  const text = el.textContent?.trim() || ''
  if (text.length < 100) return false
  // Long text (>=200) or multiple block text nodes qualify as a body container
  const targetCount = el.querySelectorAll(
    'p, li, h1, h2, h3, h4, h5, h6, blockquote'
  ).length
  return text.length >= 200 || targetCount >= 3
}

/**
 * Find the main content container inside `root`.
 * `root` is a Document (real engine) or an Element (Rule Lab fixture).
 */
export function findMainContentContainer(root: Document | Element): Element | null {
  const queryAll = (sel: string) => root.querySelectorAll<Element>(sel)

  // 1. Explicit semantic container (role="main" / <main>) — unambiguous, trust it
  const semantic =
    queryAll('[role="main"]')[0] ||
    queryAll('main')[0]
  if (semantic) return semantic

  // 2. <article> is often used for cards/list items (product cards, stat cards,
  //    news summaries, etc.); the first <article> may just be a small card,
  //    not the whole page body. Only treat it as the body container when it
  //    contains enough content.
  const article = queryAll('article')[0]
  if (article && isContentRichContainer(article)) return article

  // 3. Find the text-densest region (excluding non-content areas)
  const contentLikeTags = ['div', 'section', 'article']
  let best: Element | null = null
  let bestScore = 0

  for (const tag of contentLikeTags) {
    for (const el of queryAll(tag)) {
      if (isInNonContentArea(el)) continue
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
  //    the caller falls back to a full scan (isInNonContentArea filters nav,
  //    header, footer, sidebar, etc.).
  if (best) {
    const TARGET =
      'p, li, h1, h2, h3, h4, h5, h6, td, th, blockquote, figcaption, dt, dd, caption'
    const bestTargets = best.querySelectorAll(TARGET).length
    const bodyTargets = (root as Document).body
      ? (root as Document).body.querySelectorAll(TARGET).length
      : root.querySelectorAll(TARGET).length
    if (bestTargets < bodyTargets * 0.5) {
      return null
    }
  }

  return best
}

/* ============================================================
   Candidate collection helpers
   ============================================================ */

/**
 * Whether `el` has a bare-text-div ancestor that is an extracted candidate
 * (walks up to `root` / a structural boundary). Used to dedup inline
 * candidates (e.g. <a>) inside a link-box div — the div is translated whole.
 */
function hasExtractedDivAncestor(
  el: Element,
  root: Element,
  extractedDivs: Set<Element>
): boolean {
  let parent = el.parentElement
  while (
    parent &&
    parent !== root &&
    !STRUCTURAL.has(parent.tagName.toLowerCase())
  ) {
    if (extractedDivs.has(parent)) return true
    parent = parent.parentElement
  }
  return false
}

/**
 * Whether `el` (a bare-text div) is nested inside a translatable target tag
 * (td/li/blockquote/…) — the ancestor already covers this text.
 * Mirrors the duplicate-of-ancestor check used for standard target tags.
 */
function hasTargetTagAncestor(el: Element, root: Element): boolean {
  let parent = el.parentElement
  while (
    parent &&
    parent !== root &&
    !STRUCTURAL.has(parent.tagName.toLowerCase())
  ) {
    if (
      TARGET_TAGS.has(parent.tagName.toLowerCase()) &&
      !isInNonContentArea(parent)
    ) {
      return true
    }
    parent = parent.parentElement
  }
  return false
}

/* ============================================================
   Instrumented filtering
   ============================================================ */

function makeDecision(
  element: Element,
  reason: FilterReason,
  text?: string
): FilterDecision {
  return {
    element,
    tag: element.tagName.toLowerCase(),
    text: text ?? element.textContent?.trim() ?? '',
    extracted: reason === 'extracted',
    reason,
  }
}

/** Per-element filter verdict (order mirrors the engine's extract loop) */
function judge(el: Element, opts: FilterOptions): FilterDecision {
  const text = el.textContent?.trim() ?? ''

  // Skip non-content areas (nav, sidebar, etc.)
  if (isInNonContentArea(el)) return makeDecision(el, 'non-content-area', text)

  // Skip already-processed / injected translation nodes
  if (
    el.hasAttribute(ATTR.processed) ||
    el.hasAttribute(ATTR.translation) ||
    el.closest(`[${ATTR.translation}]`)
  ) {
    return makeDecision(el, 'already-processed', text)
  }

  // Skip non-translatable tags
  if (SKIP_TAGS.has(el.tagName.toLowerCase())) {
    return makeDecision(el, 'skip-tag', text)
  }

  // Skip elements declaring excluded roles
  const role = el.getAttribute('role')
  if (role && SKIP_ROLES.has(role)) {
    return makeDecision(el, 'skip-role', text)
  }
  const ancestorRole = el.closest('[role]')
  if (ancestorRole && SKIP_ROLES.has(ancestorRole.getAttribute('role')!)) {
    return makeDecision(el, 'skip-role', text)
  }

  if (!isElementVisible(el)) {
    return makeDecision(el, 'not-visible', text)
  }

  if (!shouldTranslateText(text, opts.targetLang)) {
    if (text.length < MIN_TEXT_LENGTH) return makeDecision(el, 'text-too-short', text)
    if (text.length > MAX_TEXT_LENGTH) return makeDecision(el, 'text-too-long', text)
    if (/^[\d\s\p{P}]+$/u.test(text)) return makeDecision(el, 'digits-or-symbols', text)
    if (/^https?:\/\/\S+$/i.test(text)) return makeDecision(el, 'url-only', text)
    return makeDecision(el, 'target-lang', text)
  }

  return makeDecision(el, 'extracted', text)
}

/**
 * Boolean filter verdict — reused by the engine on site-rule extraction paths
 * so the filtering rules live in one place.
 */
export function passesFilters(el: Element, opts: FilterOptions): boolean {
  return judge(el, opts).extracted
}

/**
 * Run the full generic filtering pipeline against `root`:
 * collect candidates → judge each → structured decisions with reasons.
 *
 * Decision order matches the engine's paragraph order:
 * standard target tags first (document order), then bare-text divs.
 *
 * NOTE: candidate collection (structural / duplicate / bare-div-threshold
 * exclusions) happens inside; filtered-out candidates appear as decisions with
 * their own reasons (layout-container / duplicate-of-ancestor / div below
 * threshold are skipped silently, mirroring the engine).
 */
export function filterParagraphs(
  root: Element,
  opts: FilterOptions
): FilterDecision[] {
  const decisions: FilterDecision[] = []
  const seen = new Set<Element>()

  // 0. Pre-pass: judge bare-text divs up front so nested inline candidates
  //    (e.g. <a> in a link-box div) can be deduplicated against them
  const divDecisions = new Map<Element, FilterDecision>()
  const extractedDivs = new Set<Element>()
  const divs = root.querySelectorAll<Element>('div')
  for (const el of divs) {
    if (!isBareTextDiv(el)) continue
    const text = el.textContent?.trim() ?? ''
    if (text.length < MIN_DIV_TEXT_LENGTH) continue
    // Nested inside a target tag (td/li/blockquote/…): the ancestor already
    // covers this text
    if (hasTargetTagAncestor(el, root)) {
      divDecisions.set(el, makeDecision(el, 'duplicate-of-ancestor'))
      continue
    }
    const d = judge(el, opts)
    divDecisions.set(el, d)
    // A processed div was extracted in a previous pass — keep deduplicating
    // nested inline candidates (e.g. <a>) against it on dynamic re-extraction
    if (d.extracted || el.hasAttribute(ATTR.processed)) extractedDivs.add(el)
  }

  // 1. Standard block text tags
  const targets = root.querySelectorAll<Element>([...TARGET_TAGS].join(','))
  for (const el of targets) {
    if (seen.has(el)) continue
    seen.add(el)

    // Structural container check (directly wraps table/ul/ol/dl)
    let child = el.firstElementChild
    let structural = false
    while (child) {
      if (STRUCTURAL.has(child.tagName.toLowerCase())) {
        structural = true
        break
      }
      child = child.nextElementSibling
    }
    if (structural) {
      decisions.push(makeDecision(el, 'layout-container'))
      continue
    }

    // Duplicate-of-ancestor check (resets past structural boundaries)
    let parent = el.parentElement
    let duplicate = false
    while (
      parent &&
      parent !== root &&
      !STRUCTURAL.has(parent.tagName.toLowerCase())
    ) {
      if (TARGET_TAGS.has(parent.tagName.toLowerCase()) && !isInNonContentArea(parent)) {
        duplicate = true
        break
      }
      parent = parent.parentElement
    }
    if (duplicate) {
      decisions.push(makeDecision(el, 'duplicate-of-ancestor'))
      continue
    }

    // Nested inside an extracted bare-text div (e.g. <a> in a link-box div):
    // the div is translated as a whole
    if (hasExtractedDivAncestor(el, root, extractedDivs)) {
      decisions.push(makeDecision(el, 'duplicate-of-ancestor'))
      continue
    }

    decisions.push(judge(el, opts))
  }

  // 2. Bare-text divs (judged in the pre-pass)
  for (const el of divs) {
    if (seen.has(el)) continue
    const d = divDecisions.get(el)
    if (!d) continue
    seen.add(el)
    decisions.push(d)
  }

  return decisions
}
