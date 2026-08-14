/**
 * siteRules — Site-specific translation rules
 *
 * For sites where the generic heuristic algorithm doesn't cover well, add custom rules here.
 * Each rule defines the site's "main content container" and "exclude selectors",
 * ensuring only the page body is translated, skipping nav, sidebar, footer, and other UI elements.
 *
 * Adding a new site:
 * 1. Add a rule to `ALL_SITE_RULES`
 * 2. Use `siteRules.at(-1)` to verify the last rule
 */

/* ============================================================
   Type Definitions
   ============================================================ */
export interface SiteRule {
  /** Site name (for identification only) */
  name: string
  /** Matching domain list (supports subdomains) */
  domains: string[]
  /** CSS selector for the main content container (paragraphs extracted only within it) */
  mainSelector?: string
  /** Additional exclude selectors (further exclude non-content areas within the container) */
  excludeSelectors?: string[]
  /**
   * Custom extraction function (optional).
   * When mainSelector + excludeSelectors are insufficient,
   * completely takes over the extraction logic.
   * Returns all translatable paragraph nodes.
   */
  customExtract?: () => Element[]
  /**
   * Supplemental mode (optional, requires customExtract): the generic
   * full-page scan still runs, and this rule's customExtract result is MERGED
   * into it (deduped by node). Use for sites where the generic rules already
   * cover most content but miss a specific container (e.g. TikTok short
   * comment texts in bare divs). Without this flag the rule replaces the
   * generic extraction entirely.
   */
  supplemental?: boolean
}

/* ============================================================
   GitHub Rule
   ============================================================ */
const githubRule: SiteRule = {
  name: 'GitHub',
  domains: ['github.com', 'www.github.com'],

  // Translate About description + all markdown content (README, release previews, comments, etc.)
  customExtract: () => {
    const result: Element[] = []
    const visited = new Set<Element>()
    const TARGET = 'p, h1, h2, h3, h4, h5, h6, li, td, th, blockquote, dt, dd'

    // 1. About description
    // GitHub uses Primer CSS (CSS Modules hashed class names); find the About paragraph by content match
    const aboutHeadings = document.querySelectorAll<Element>('h2, h3, h4')
    for (const heading of aboutHeadings) {
      if (/^about$/i.test(heading.textContent?.trim() || '')) {
        const aboutSection = heading.parentElement
        if (!aboutSection) break
        const aboutP = aboutSection.querySelector<Element>('p')
        if (aboutP && !visited.has(aboutP) && aboutP.textContent?.trim()) {
          visited.add(aboutP)
          result.push(aboutP)
        }
        break
      }
    }

    // 2. All .markdown-body containers (article/README, section/release previews, comments, etc.)
    //    Release body previews on the feed page use <section class="markdown-body">
    const markdownBodies = document.querySelectorAll<Element>('.markdown-body')
    for (const md of markdownBodies) {
      const els = md.querySelectorAll<Element>(TARGET)
      for (const el of els) {
        if (visited.has(el)) continue
        if (!el.textContent?.trim()) continue
        visited.add(el)
        result.push(el)
      }
    }

    // 3. Plain-text descriptions in the feed (repo descriptions, etc. — <div> without markdown wrapper)
    //    Only extract pure text leaf nodes (no child elements) to avoid breaking flex/grid layouts
    const mainArea = document.querySelector('main, [role="main"], article') || document.body
    const leafDivs = mainArea.querySelectorAll<Element>('div')
    for (const el of leafDivs) {
      if (visited.has(el)) continue
      if (el.closest('.markdown-body')) continue
      if (el.closest('nav, header, footer, aside, [role="navigation"], [role="banner"], [role="contentinfo"]')) continue
      // Only extract divs with zero child elements (text-only, not layout containers / card frames)
      if (el.children.length > 0) continue
      const text = el.textContent?.trim() || ''
      if (text.length < 30) continue
      if (/^[\d\s\p{P}]+$/u.test(text)) continue
      visited.add(el)
      result.push(el)
    }

    return result
  },
}

/* ============================================================
   Wikipedia Rule
   ============================================================ */
const wikipediaRule: SiteRule = {
  name: 'Wikipedia',
  domains: ['wikipedia.org', 'www.wikipedia.org',
    'zh.wikipedia.org', 'en.wikipedia.org', 'ja.wikipedia.org',
    'fr.wikipedia.org', 'de.wikipedia.org', 'ru.wikipedia.org',
    'ko.wikipedia.org', 'es.wikipedia.org',
  ],

  // Wikipedia main content area
  mainSelector: '#mw-content-text, div.mw-parser-output',

  excludeSelectors: [
    // Table of contents
    '.toc', '#toc', '.mw-toc',
    // Sidebar
    '.sidebar', '.mw-sidebar',
    // Infobox (right-side info card)
    '.infobox', '.mw-infobox',
    // Navigation box
    '.navbox', '.mw-navbox',
    // Footnotes
    '.reflist', '.references',
    // Edit links
    '.mw-editsection',
    // Page bottom navigation
    '.catlinks', '.mw-normal-catlinks',
    // Sister project links
    '.sisterproject',
    // Short description
    '.shortdescription',
  ],
}

/* ============================================================
   YouTube Rule
   ============================================================ */
const youtubeRule: SiteRule = {
  name: 'YouTube',
  domains: ['youtube.com', 'www.youtube.com', 'm.youtube.com'],

  mainSelector: '#primary',

  excludeSelectors: [
    '#related, #secondary, ytd-watch-next-secondary-results-renderer',
    '#header, #author-button, #top-level-buttons',
    '#masthead-container',
    '#chat-container, #live-chat-iframe',
    'ytd-macro-markers-list-renderer',
    'ytd-offer-module-renderer',
  ],

  // YouTube body text uses yt-formatted-string (custom element),
  // not standard <p>/<h1> etc. Needs special handling.
  customExtract: () => {
    const result: Element[] = []
    const visited = new Set<Element>()
    // Exclude selectors (consistent with excludeSelectors, plus username area)
    const skipSel = '#related, #secondary, ytd-watch-next-secondary-results-renderer, ' +
      '#header, #header-author, [id*=author], #author-button, #author-text, #top-level-buttons, ' +
      '#masthead-container, #chat-container, #live-chat-iframe, ' +
      'ytd-macro-markers-list-renderer, ytd-offer-module-renderer'
    const isSkipped = (el: Element) => el.closest(skipSel)

    const primary = document.querySelector('#primary')
    if (!primary) return result

    // 1. Video title
    const title = primary.querySelector<Element>('h1 yt-formatted-string')
    if (title && !visited.has(title)) {
      visited.add(title)
      if (title.textContent?.trim()) result.push(title)
    }

    // 2. Video description (more content after expanding)
    const desc = primary.querySelector<Element>('#description yt-formatted-string')
    if (desc && !visited.has(desc)) {
      visited.add(desc)
      if (desc.textContent?.trim()) result.push(desc)
    }

    // 3. Comment body only (exclude title count, username, action buttons)
    const commentTexts = primary.querySelectorAll<Element>(
      '#comments #content-text, #comments #comment-content-text'
    )
    for (const el of commentTexts) {
      if (visited.has(el) || isSkipped(el)) continue
      visited.add(el)
      const text = el.textContent?.trim()
      if (text && text.length > 3) result.push(el)
    }

    // 4. Standard tag fallback (in case YouTube redesigns)
    const standard = primary.querySelectorAll<Element>(
      'p, h1, h2, h3, h4, h5, h6, li, td, th, blockquote'
    )
    for (const el of standard) {
      if (visited.has(el) || isSkipped(el)) continue
      visited.add(el)
      if (el.textContent?.trim()) result.push(el)
    }

    return result
  },
}

/* ============================================================
   Reddit Rule
   ============================================================ */
const redditRule: SiteRule = {
  name: 'Reddit',
  domains: ['reddit.com', 'www.reddit.com', 'old.reddit.com'],

  // New shreddit UI renders all content inside <main>; the legacy rule matched
  // .md which only exists in the sidebar now, so the feed/post pages were never
  // translated. mainSelector is used by the dynamic observer.
  mainSelector: 'main, [id="main-content"]',

  excludeSelectors: [
    // Sidebar
    'aside, .side, [data-testid="subreddit-sidebar"]',
    // Ads
    '.ad-container, shreddit-ad-post',
    // Navigation
    '#header',
    // Premium banner
    '.premium-banner',
    // Author/credit bars & duplicate overlay/screen-reader text
    '[slot="credit-bar"], a[slot="full-post-link"], faceplate-screen-reader-content, shreddit-post-flair',
  ],

  customExtract: () => {
    const result: Element[] = []
    const visited = new Set<Element>()
    const TARGET =
      'p, h1, h2, h3, h4, h5, h6, li, td, th, blockquote, dt, dd, figcaption'

    const isExcluded = (el: Element) =>
      el.closest(
        'aside, .side, [data-testid="subreddit-sidebar"], .ad-container, shreddit-ad-post, #header, .premium-banner, [slot="credit-bar"], a[slot="full-post-link"], faceplate-screen-reader-content, shreddit-post-flair'
      )

    // ---- New shreddit UI ----
    if (document.querySelector('shreddit-post')) {
      // 1. Post titles (feed: <a slot=title>, post page: <h1 slot=title>)
      const titles = document.querySelectorAll<Element>('shreddit-post [slot="title"]')
      for (const el of titles) {
        if (visited.has(el) || isExcluded(el)) continue
        if (!el.textContent?.trim()) continue
        visited.add(el)
        result.push(el)
      }

      // 2. Feed body previews (self-post snippets; skip link-post pure URLs)
      const previews = document.querySelectorAll<Element>('shreddit-post div[class*="truncate"]')
      for (const el of previews) {
        if (visited.has(el) || isExcluded(el)) continue
        const text = el.textContent?.trim() ?? ''
        if (!text || /^https?:\/\//i.test(text)) continue
        visited.add(el)
        result.push(el)
      }

      // 3. Post body + comment bodies (rtjson text blocks & .md within main)
      const main = document.querySelector('main, [id="main-content"]') || document.body
      const textRoots = main.querySelectorAll<Element>('[id*="-rtjson-content"], .md')
      for (const root of textRoots) {
        const els = root.querySelectorAll<Element>(TARGET)
        for (const el of els) {
          if (visited.has(el) || isExcluded(el)) continue
          if (!el.textContent?.trim()) continue
          visited.add(el)
          result.push(el)
        }
      }
      return result
    }

    // ---- Legacy UI (old.reddit.com) ----
    const legacyRoots = document.querySelectorAll<Element>(
      '.link, .usertext-body, .md, .comment'
    )
    for (const root of legacyRoots) {
      const els = root.querySelectorAll<Element>(TARGET)
      for (const el of els) {
        if (visited.has(el)) continue
        if (el.closest('.side, .ad-container, #header')) continue
        if (!el.textContent?.trim()) continue
        visited.add(el)
        result.push(el)
      }
    }
    return result
  },
}

/* ============================================================
   X (Twitter) Rule
   ============================================================ */
const xRule: SiteRule = {
  name: 'X',
  domains: ['x.com', 'twitter.com', 'www.x.com', 'www.twitter.com', 'mobile.twitter.com'],

  mainSelector: 'main',

  customExtract: () => {
    const result: Element[] = []
    const visited = new Set<Element>()
    const TWEET_TEXT_SEL = '[class*="whitespace-pre-wrap"]'

    // New X UI: tweet text renders in div/span with the whitespace-pre-wrap class
    // (no <p> tags). Exclude <a> (timestamp links share the class); keep only the
    // outermost matching text container for nested matches.
    const containers = [...document.querySelectorAll<Element>(
      `article ${TWEET_TEXT_SEL}:not(a)`
    )]
    for (const el of containers) {
      if (visited.has(el)) continue
      if (containers.some((o) => o !== el && o.contains(el))) continue
      if (!el.textContent?.trim()) continue
      visited.add(el)
      result.push(el)
    }

    // Legacy X UI: data-testid="tweetText"
    const legacy = document.querySelectorAll<Element>('[data-testid="tweetText"]')
    for (const el of legacy) {
      if (visited.has(el)) continue
      if (!el.textContent?.trim()) continue
      visited.add(el)
      result.push(el)
    }

    return result
  },
}

/* ============================================================
   TikTok Rule (supplemental: adds comment bodies to the generic full-page scan)
   ============================================================ */
const tiktokRule: SiteRule = {
  name: 'TikTok',
  domains: ['tiktok.com', 'www.tiktok.com', 'm.tiktok.com'],

  // Supplemental: the generic full-page scan already covers video captions
  // (bare text divs ≥30 chars) and long comments. This rule only ADDS
  // comment bodies: TikTok renders them in
  // <span data-e2e="comment-level-N"> (N = reply depth; verified on the live
  // page 2026-08) — spans are NOT in TARGET_TAGS and never reach the bare-div
  // path, so generic rules would drop them entirely. Username lives in
  // [data-e2e^="comment-username-"] (a > p) and is excluded via
  // excludeSelectors (applied to the generic scan in supplemental mode). No
  // mainSelector: the dynamic observer watches document.body so
  // lazily-loaded comments are picked up too.
  supplemental: true,

  // Username is a link (a > p) in [data-e2e^="comment-username-"]; it is a
  // TARGET_TAG so the generic scan would translate it. Exclude the whole
  // username region.
  excludeSelectors: ['[data-e2e^="comment-username-"]'],

  customExtract: () => {
    const result: Element[] = []
    const visited = new Set<Element>()
    const commentLevels = document.querySelectorAll<Element>(
      '[data-e2e^="comment-level-"]'
    )
    for (const el of commentLevels) {
      if (visited.has(el)) continue
      const text = el.textContent?.trim() ?? ''
      if (!text || text.length < 2) continue
      visited.add(el)
      result.push(el)
    }
    return result
  },
}

/* ============================================================
   All Site Rules
   ============================================================ */
const ALL_SITE_RULES: SiteRule[] = [
  githubRule,
  wikipediaRule,
  youtubeRule,
  redditRule,
  xRule,
  tiktokRule,
]

/* ============================================================
   Domain Matching
   ============================================================ */
function matchDomain(hostname: string, domains: string[]): boolean {
  return domains.some((d) => hostname === d || hostname.endsWith('.' + d))
}

/* ============================================================
   Get the rule for the current site
   ============================================================ */
export function getSiteRule(): SiteRule | null {
  const hostname = location.hostname.toLowerCase()
  for (const rule of ALL_SITE_RULES) {
    if (matchDomain(hostname, rule.domains)) {
      return rule
    }
  }
  return null
}

/* ============================================================
   Extract paragraph nodes using the site rule
   ============================================================ */
export function extractWithSiteRule(
  rule: SiteRule
): Element[] {
  const TARGET = new Set([
    'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'li', 'td', 'th', 'blockquote', 'figcaption',
    'dt', 'dd', 'caption',
  ])

  // If the rule has customExtract, use it directly
  if (rule.customExtract) {
    return rule.customExtract()
  }

  // Find containers by mainSelector
  const containers: Element[] = []
  if (rule.mainSelector) {
    const found = document.querySelectorAll<Element>(rule.mainSelector)
    found.forEach((el) => containers.push(el))
  }
  if (containers.length === 0) {
    // fallback: use document.body
    containers.push(document.body)
  }

  // Merge excludeSelectors
  const excludeSel = rule.excludeSelectors?.join(', ') || ''

  const result: Element[] = []
  const visited = new Set<Element>()

  for (const container of containers) {
    const elements = container.querySelectorAll<Element>([...TARGET].join(','))
    for (const el of elements) {
      if (visited.has(el)) continue

      // Exclude specified selectors
      if (excludeSel && el.closest(excludeSel)) {
        visited.add(el)
        continue
      }

      // Exclude deep nesting — only keep the innermost translatable node
      let parent = el.parentElement
      let skip = false
      while (parent && parent !== container) {
        if (TARGET.has(parent.tagName.toLowerCase())) {
          skip = true
          break
        }
        parent = parent.parentElement
      }
      if (skip) { visited.add(el); continue }
      visited.add(el)
      result.push(el)
    }
  }

  return result
}
