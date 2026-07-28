/**
 * siteRules -- 站点特定翻译规则
 *
 * 对于通用启发式算法覆盖不佳的站点,在此处添加自定义规则。
 * 每个规则定义该站点的"主要内容容器"和"排除选择器",
 * 确保只翻译页面正文,跳过导航、侧栏、页脚等 UI 元素。
 *
 * 新增站点步骤:
 * 1. 在 `ALL_SITE_RULES` 中添加一条规则
 * 2. 用 `siteRules.at(-1)` 获取最后一条规则确认
 */

/* ============================================================
   类型定义
   ============================================================ */
export interface SiteRule {
  /** 站点名称(仅用于标识) */
  name: string
  /** 匹配的域名列表(支持子域名) */
  domains: string[]
  /** 主要内容容器的 CSS 选择器(选中的容器内才提取段落) */
  mainSelector?: string
  /** 额外排除的选择器(在容器内进一步排除非内容区域) */
  excludeSelectors?: string[]
  /**
   * 自定义提取函数(可选)。
   * 当 mainSelector + excludeSelectors 不够用时,
   * 完全接管提取逻辑。
   * 返回所有可翻译的段落节点。
   */
  customExtract?: () => Element[]
}

/* ============================================================
   GitHub 规则
   ============================================================ */
const githubRule: SiteRule = {
  name: 'GitHub',
  domains: ['github.com', 'www.github.com'],

  // 仓库详情页只翻译 About 描述 + README.md
  customExtract: () => {
    const result: Element[] = []
    const visited = new Set<Element>()
    const TARGET = 'p, h1, h2, h3, h4, h5, h6, li, td, th, blockquote, dt, dd'

    // 1. About 描述
    // GitHub 使用 Primer CSS（CSS Modules 哈希类名），通过内容匹配找到 About 段落
    const aboutHeadings = document.querySelectorAll<Element>('h2, h3, h4')
    for (const heading of aboutHeadings) {
      if (/^about$/i.test(heading.textContent?.trim() || '')) {
        const section = heading.parentElement
        if (!section) break
        const aboutP = section.querySelector<Element>('p')
        if (aboutP && !visited.has(aboutP) && aboutP.textContent?.trim()) {
          visited.add(aboutP)
          result.push(aboutP)
        }
        break
      }
    }

    // 2. README.md
    const readme = document.querySelector<Element>('article.markdown-body')
    if (readme) {
      const els = readme.querySelectorAll<Element>(TARGET)
      for (const el of els) {
        if (visited.has(el)) continue
        if (!el.textContent?.trim()) continue
        visited.add(el)
        result.push(el)
      }
    }

    return result
  },
}

/* ============================================================
   Wikipedia 规则
   ============================================================ */
const wikipediaRule: SiteRule = {
  name: 'Wikipedia',
  domains: ['wikipedia.org', 'www.wikipedia.org',
    'zh.wikipedia.org', 'en.wikipedia.org', 'ja.wikipedia.org',
    'fr.wikipedia.org', 'de.wikipedia.org', 'ru.wikipedia.org',
    'ko.wikipedia.org', 'es.wikipedia.org',
  ],

  // Wikipedia 的主要内容区
  mainSelector: '#mw-content-text, div.mw-parser-output',

  excludeSelectors: [
    // 目录
    '.toc', '#toc', '.mw-toc',
    // 侧边栏
    '.sidebar', '.mw-sidebar',
    // 信息框(右侧的信息卡片)
    '.infobox', '.mw-infobox',
    // 导航框
    '.navbox', '.mw-navbox',
    // 脚注
    '.reflist', '.references',
    // 编辑链接
    '.mw-editsection',
    // 页面底部导航
    '.catlinks', '.mw-normal-catlinks',
    // 姊妹项目链接
    '.sisterproject',
    // 短描述
    '.shortdescription',
  ],
}

/* ============================================================
   YouTube 规则
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

  // YouTube 正文使用 yt-formatted-string（自定义元素）存放文本，
  // 不是标准 <p>/<h1> 等。需要特殊处理。
  customExtract: () => {
    const result: Element[] = []
    const visited = new Set<Element>()
    // 排除选择器（与 excludeSelectors 保持一致，额外加上用户名区域）
    const skipSel = '#related, #secondary, ytd-watch-next-secondary-results-renderer, ' +
      '#header, #header-author, [id*=author], #author-button, #author-text, #top-level-buttons, ' +
      '#masthead-container, #chat-container, #live-chat-iframe, ' +
      'ytd-macro-markers-list-renderer, ytd-offer-module-renderer'
    const isSkipped = (el: Element) => el.closest(skipSel)

    const primary = document.querySelector('#primary')
    if (!primary) return result

    // 1. 视频标题
    const title = primary.querySelector<Element>('h1 yt-formatted-string')
    if (title && !visited.has(title)) {
      visited.add(title)
      if (title.textContent?.trim()) result.push(title)
    }

    // 2. 视频描述（展开后会有更多内容）
    const desc = primary.querySelector<Element>('#description yt-formatted-string')
    if (desc && !visited.has(desc)) {
      visited.add(desc)
      if (desc.textContent?.trim()) result.push(desc)
    }

    // 3. 评论区只取正文（排除标题计数、用户名、操作按钮）
    const commentTexts = primary.querySelectorAll<Element>(
      '#comments #content-text, #comments #comment-content-text'
    )
    for (const el of commentTexts) {
      if (visited.has(el) || isSkipped(el)) continue
      visited.add(el)
      const text = el.textContent?.trim()
      if (text && text.length > 3) result.push(el)
    }

    // 4. 标准标签回退（如果 YouTube 未来改版）
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
   Reddit 规则
   ============================================================ */
const redditRule: SiteRule = {
  name: 'Reddit',
  domains: ['reddit.com', 'www.reddit.com', 'old.reddit.com'],

  mainSelector: '[data-testid="post-container"], .link, .usertext-body, .md',

  excludeSelectors: [
    // 侧边栏
    '.side',
    // 广告
    '.ad-container',
    // 导航
    '#header',
    // 社区详情侧栏
    '[data-testid="subreddit-sidebar"]',
    // 特惠信息
    '.premium-banner',
  ],
}

/* ============================================================
   所有站点规则列表
   ============================================================ */
const ALL_SITE_RULES: SiteRule[] = [
  githubRule,
  wikipediaRule,
  youtubeRule,
  redditRule,
]

/* ============================================================
   域名匹配
   ============================================================ */
function matchDomain(hostname: string, domains: string[]): boolean {
  return domains.some((d) => hostname === d || hostname.endsWith('.' + d))
}

/* ============================================================
   获取当前站点对应的规则
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
   使用站点规则提取段落节点
   ============================================================ */
export function extractWithSiteRule(
  rule: SiteRule
): Element[] {
  const TARGET = new Set([
    'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'li', 'td', 'th', 'blockquote', 'figcaption',
    'dt', 'dd', 'caption',
  ])

  // 如果规则有 customExtract,直接使用
  if (rule.customExtract) {
    return rule.customExtract()
  }

  // 根据 mainSelector 找到容器
  const containers: Element[] = []
  if (rule.mainSelector) {
    const found = document.querySelectorAll<Element>(rule.mainSelector)
    found.forEach((el) => containers.push(el))
  }
  if (containers.length === 0) {
    // fallback: 使用 document.body
    containers.push(document.body)
  }

  // 合并 excludeSelectors
  const excludeSel = rule.excludeSelectors?.join(', ') || ''

  const result: Element[] = []
  const visited = new Set<Element>()

  for (const container of containers) {
    const elements = container.querySelectorAll<Element>([...TARGET].join(','))
    for (const el of elements) {
      if (visited.has(el)) continue

      // 排除指定选择器
      if (excludeSel && el.closest(excludeSel)) {
        visited.add(el)
        continue
      }

      // 排除深层嵌套--只保留最内层的可翻译节点
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
