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

/** Combined skip-tag selector for self-or-ancestor checks */
const SKIP_TAGS_SELECTOR = [...SKIP_TAGS].join(',')

/**
 * ARIA roles excluded from translation.
 *
 * NOTE: role="tabpanel" is deliberately NOT excluded. A tabpanel is the
 * content pane of a tab UI, and journal/article sites (tandfonline,
 * sciencedirect, springer, …) render the entire article body inside one
 * (role="main" > … > [role="tabpanel"]). Excluding it silently dropped the
 * whole article. Hidden tabpanels are already filtered by isElementVisible()
 * (display:none / visibility:hidden / aria-hidden), so the role check is only
 * needed for the visible, real content pane.
 *
 * By contrast role="tab" (the tab BUTTON itself) IS excluded: it is the tab
 * bar's chrome, like role="tablist". Also excluded are menu items and
 * tooltips — unambiguous UI chrome roles, added defensively (they are usually
 * already covered by their container roles menu/menubar/tablist, but some
 * UIs omit the container role).
 *
 * NOTE: role="complementary" is deliberately NOT excluded (removed 2026-08).
 * The full-page scan route translates out-of-container content too, and
 * social sites (TikTok comments, etc.) put real content in aside-like
 * complementary regions. Sidebar-style nav is still caught by the link-density
 * heuristic (isInNonContentArea Layer 2) and shouldTranslateText filters.
 */
export const SKIP_ROLES = new Set([
  'navigation', 'banner', 'contentinfo',
  'alert', 'alertdialog', 'dialog', 'toolbar',
  'menu', 'menubar', 'menuitem', 'menuitemcheckbox', 'menuitemradio',
  'tab', 'tooltip',
  'presentation',
  // An editable input region (CodeMirror/ProseMirror editors, etc.)
  'textbox',
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
 * Block-level text units that mark a bare-text div as a container when they
 * appear deeper inside its inline wrappers (see isBareTextDiv).
 */
const BLOCK_DESC_SELECTOR =
  'div, p, ul, ol, li, dl, dt, dd, table, td, th, h1, h2, h3, h4, h5, h6, ' +
  'blockquote, figure, figcaption, section, article, header, footer, nav, ' +
  'aside, main, form, fieldset, details, iframe'

/**
 * A div is treated as a bare text container when it has no element children,
 * or its children are all inline-level content. Classic forum/blog layouts
 * (phpBB, vBulletin, …) render multi-line post text as raw text nodes
 * separated by <br> with smilies/embedded images inline; block children
 * (div/p/ul/table/…) mark layout frames instead.
 *
 * EXCEPTION (2026-08): a div whose children are ALL <a> links is a layout
 * frame (link box / card grid / news list), NOT a text container. Translating
 * the whole block merged N independent items (e.g. 8 news articles) into one
 * paragraph (ozon.ru news list case); each link is its own content unit and
 * should be translated separately. Short-link nav blocks are still filtered
 * by the link-density heuristic in isInNonContentArea.
 */
function isBareTextDiv(el: Element): boolean {
  if (el.children.length === 0) return true
  const allLinks = [...el.children].every(
    (c) => c.tagName.toLowerCase() === 'a'
  )
  if (allLinks) return false
  for (const child of el.children) {
    if (!INLINE_TEXT_TAGS.has(child.tagName.toLowerCase())) return false
  }
  // Inline wrappers that contain further block-level text units (e.g. an
  // author list rendered as <div><span><span><div class="entryAuthor">…</div>
  // …</span></span></div>) are containers, not a single paragraph —
  // translating the whole div would merge N independent items (tandfonline
  // author block). The nested units translate individually instead.
  if (el.querySelector(BLOCK_DESC_SELECTOR)) return false
  return true
}

/**
 * Whether `el` is a layout frame instead of a translatable text unit:
 * 1. Directly wraps a structural list/table (existing rule).
 * 2. <li>/<a> with layout-frame children (cards, card links).
 */
export function isLayoutContainer(el: Element): boolean {
  const tag = el.tagName.toLowerCase()
  // 1. Directly wraps a structural list/table
  let child = el.firstElementChild
  while (child) {
    if (STRUCTURAL.has(child.tagName.toLowerCase())) return true
    child = child.nextElementSibling
  }
  // 2. <li>/<a> with layout-frame children
  if (tag === 'li' || tag === 'a') {
    for (const c of el.children) {
      if (LAYOUT_TAGS.has(c.tagName.toLowerCase())) return true
      // A link wrapping layout content (card link: <li><a><div>…</a></li>)
      // marks the li as a card frame too
      if (
        tag === 'li' &&
        c.tagName.toLowerCase() === 'a' &&
        [...c.children].some((cc) =>
          LAYOUT_TAGS.has(cc.tagName.toLowerCase())
        )
      ) {
        return true
      }
    }
  }
  return false
}

/** Combined non-content selectors (single closest() match) */
export const NON_CONTENT_SELECTOR = [
  'nav', 'header', 'footer',
  '[role="navigation"]', '[role="banner"]', '[role="contentinfo"]',
  // The bare <aside> tag is intentionally absent (removed 2026-08), like
  // [role="complementary"]: <aside> IS the HTML element whose implicit ARIA
  // role is complementary, and with the full-page scan those regions carry
  // real content (TikTok's comment sidebar renders as a bare <aside> with no
  // role attribute — excluding the tag silently dropped every comment).
  // Sidebar-style nav is still caught by the link-density heuristic (Layer 2)
  // and by .sidebar / #sidebar class selectors below.
  // [role="tabpanel"] is intentionally absent: it is the content pane of a
  // tab UI, not chrome (see SKIP_ROLES note). The tab bar ([role="tablist"])
  // and tab buttons ([role="tab"]) stay.
  '[role="tablist"]', '[role="tab"]',
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

/**
 * Layout-frame elements (default display: block AND structurally a container):
 * a card/feed <li>/<a> containing any of these is a layout frame (product
 * cards with an image + buttons + spec text, card links wrapping <div>s, …),
 * NOT a text unit — its nested text elements are translated individually.
 *
 * Text-level blocks (p, h1-h6, blockquote, pre…) are deliberately NOT here:
 * <li><p>text</p></li> and <a><p>…</p></a> are plain text units and keep
 * their whole-element translation.
 *
 * Translating a card element as one paragraph merges all its independent
 * texts into ONE giant translation block appended inside it, which breaks
 * card grids:
 *  - percentage-height chains (`height: 100%`, `grid-template-rows: 1fr
 *    auto`, `margin-top: auto`): the block inflates the card by thousands
 *    of px (KEYENCE product list: ~4.5k px blank + layout crossover);
 *  - fixed-height grid rows: the block overflows the card box into the
 *    next row.
 */
const LAYOUT_TAGS = new Set([
  'div', 'table', 'ul', 'ol', 'dl', 'figure', 'figcaption',
  'section', 'article', 'header', 'footer', 'nav', 'aside', 'main',
  'form', 'fieldset', 'details', 'video', 'audio', 'canvas', 'iframe',
  'address', 'hr',
])

/**
 * Semantic non-content regions that override tab-pane content status.
 * Class-based exclusions (.tabs / .menu / .dropdown …) are ambiguous — they
 * often wrap real content panes — so they must NOT override a tab panel, but
 * a genuinely semantic region (nav / header / footer / aside / sidebar) still
 * wins.
 */
const SEMANTIC_NON_CONTENT_SELECTOR = [
  'nav', 'header', 'footer',
  '[role="navigation"]', '[role="banner"]', '[role="contentinfo"]',
  '.sidebar', '.Sidebar', '#sidebar', '#Sidebar',
].join(',')

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
  | 'editable'              // inside a contenteditable editor region
  | 'no-translate'          // marked translate="no" / .notranslate

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
  if (el.closest(NON_CONTENT_SELECTOR)) {
    // Content inside a [role=tabpanel] is the tab pane's real content. Tab
    // widgets (tandfonline's div.tabs.tabs-widget, etc.) wrap the pane in a
    // generic "tabs"/"menu"-style class, so the class match alone would kill
    // the whole pane. Only a semantic region (nav/header/footer/aside/
    // sidebar) can override a tab panel; hidden panes are filtered later by
    // isElementVisible (display:none / aria-hidden).
    const pane = el.closest('[role="tabpanel"]')
    if (pane && !pane.closest(SEMANTIC_NON_CONTENT_SELECTOR)) {
      return false
    }
    return true
  }

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
    return getText(el)
  }
  const clone = el.cloneNode(true) as Element
  clone.querySelectorAll(`[${ATTR.translation}]`).forEach((n) => n.remove())
  return getText(clone)
}

/**
 * Normalized readable text of an element: collapse every whitespace run
 * (including DOM-indentation newlines from nested inline markup) into a
 * single space. Raw `textContent` keeps the source indentation, which gets
 * echoed back by translators and explodes under `white-space: pre-wrap`
 * (tandfonline journal header: a 20-char translation rendered 1254px tall).
 */
export function getText(el: Element): string {
  return (el.textContent ?? '').replace(/\s+/g, ' ').trim()
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
      !isLayoutContainer(parent) &&
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
    text: text ?? getText(element),
    extracted: reason === 'extracted',
    reason,
  }
}

/** Per-element filter verdict (order mirrors the engine's extract loop) */
function judge(el: Element, opts: FilterOptions): FilterDecision {
  const text = getText(el)

  // Skip non-content areas (nav, sidebar, etc.)
  if (isInNonContentArea(el)) return makeDecision(el, 'non-content-area', text)

  // Layout frames (directly wraps a table/list, or an <li> with block-level
  // children — cards/feed items are not text units)
  if (isLayoutContainer(el)) return makeDecision(el, 'layout-container', text)

  // Skip already-processed / injected translation nodes
  if (
    el.hasAttribute(ATTR.processed) ||
    el.hasAttribute(ATTR.translation) ||
    el.closest(`[${ATTR.translation}]`)
  ) {
    return makeDecision(el, 'already-processed', text)
  }

  // Skip non-translatable tags — self OR any ancestor. Code editors such as
  // CodeMirror/Sandpack render lines as div.cm-line inside <pre><code>, so an
  // element-own tag check alone leaks code text into the candidate set.
  if (
    SKIP_TAGS.has(el.tagName.toLowerCase()) ||
    el.closest(SKIP_TAGS_SELECTOR)
  ) {
    return makeDecision(el, 'skip-tag', text)
  }

  // Skip editable regions (CodeMirror, ProseMirror, rich-text editors…).
  // Live editors render lines as bare divs; inserting translation nodes into
  // their contenteditable content is absorbed as user input and corrupts the
  // editor's document model (e.g. Sandpack re-compiles translated code).
  if ((el as HTMLElement).isContentEditable) {
    return makeDecision(el, 'editable', text)
  }

  // Skip content explicitly marked non-translatable by the page itself
  // (HTML translate attribute / Google Translate "notranslate" convention)
  if (el.closest('[translate="no"], .notranslate')) {
    return makeDecision(el, 'no-translate', text)
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
    const text = getText(el)
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

    // Layout container check (directly wraps table/ul/ol/dl, or an <li> with
    // block-level children — cards/feed items are not text units)
    if (isLayoutContainer(el)) {
      decisions.push(makeDecision(el, 'layout-container'))
      continue
    }

    // Duplicate-of-ancestor check (resets past structural boundaries)
    // An ancestor TARGET_TAG counts as duplicate even when it was ALREADY
    // translated (ATTR.processed): on dynamic re-scans, injected translation
    // nodes next to the original (e.g. <a>译文<a>) inflate the link-density
    // heuristic, so isInNonContentArea may flip to true and let nested nodes
    // (e.g. <p> inside the <a>) slip through → double translation. The
    // processed-ancestor check only covers TARGET_TAG ancestors, so lazily
    // loaded content inside non-target containers (article/div) is unaffected.
    let parent = el.parentElement
    let duplicate = false
    while (
      parent &&
      parent !== root &&
      !STRUCTURAL.has(parent.tagName.toLowerCase())
    ) {
      if (
        TARGET_TAGS.has(parent.tagName.toLowerCase()) &&
        // A layout-frame ancestor (card <li>, …) is NOT a covering text unit
        // — nested elements translate individually
        !isLayoutContainer(parent) &&
        (parent.hasAttribute(ATTR.processed) || !isInNonContentArea(parent))
      ) {
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
