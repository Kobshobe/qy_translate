<template>
  <div class="rule-lab">
    <!-- ===== Top control bar ===== -->
    <div class="lab-toolbar">
      <label class="lab-label">Target lang</label>
      <select v-model="targetLang" class="lab-select lang-select" @change="run">
        <option value="auto">auto</option>
        <option value="zh-CN">zh-CN</option>
        <option value="en">en</option>
        <option value="ja">ja</option>
        <option value="ko">ko</option>
        <option value="ru">ru</option>
        <option value="fr">fr</option>
        <option value="de">de</option>
        <option value="es">es</option>
      </select>

      <button class="lab-btn primary" @click="run">Run</button>

      <div class="toolbar-spacer"></div>

      <label class="lab-check">
        <input type="checkbox" v-model="showExtracted" @change="applyMarks" /> extracted
      </label>
      <label class="lab-check">
        <input type="checkbox" v-model="showFiltered" @change="applyMarks" /> filtered
      </label>

      <select v-model="resultFilter" class="lab-select filter-select">
        <option value="all">all results</option>
        <option value="extracted">extracted only</option>
        <option value="filtered">filtered only</option>
      </select>

      <input v-model="search" class="lab-input search-input" placeholder="search text / tag / reason…" />
    </div>

    <!-- ===== Stats bar ===== -->
    <div class="lab-stats">
      <span class="stat total">candidates: {{ decisions.length }}</span>
      <span class="stat extracted">extracted: {{ extractedCount }}</span>
      <span class="stat filtered">filtered: {{ filteredCount }}</span>
      <span class="stat container">main container: <code>{{ containerDesc }}</code></span>
      <span v-for="(count, reason) in filteredByReason" :key="reason" class="stat reason-chip" :title="reasonLabel(reason)">
        {{ shortReason(reason) }}: {{ count }}
      </span>
    </div>

    <!-- ===== Main split: the fixed test page + decision table ===== -->
    <div class="lab-main">
      <!-- The test page itself (this page IS the translation target) -->
      <div class="lab-preview-pane">
        <div class="pane-title">Test page (translation target)</div>
        <div class="lab-preview-scroll">
          <div ref="previewEl" class="qyt-test-page">
            <!-- ==================== site header / nav ==================== -->
            <header class="site-header">
              <div class="brand">QY Translate</div>
              <nav class="main-nav">
                <ul>
                  <li><a href="#">Home</a></li>
                  <li><a href="#">Features</a></li>
                  <li><a href="#">Pricing</a></li>
                  <li><a href="#">Blog</a></li>
                  <li><a href="#">Contact</a></li>
                </ul>
              </nav>
            </header>

            <main class="test-main">
              <!-- ==================== article ==================== -->
              <article class="post">
                <h1>How the Page Translation Engine Works</h1>
                <p class="post-meta">By QY Translate Team · Updated March 2026</p>

                <p>
                  The page translation engine walks the DOM and extracts translatable paragraph nodes before
                  sending them to the background translation service. It manages the status of every paragraph
                  and controls concurrent translation with batching and throttling so the page stays responsive
                  even on long documents with hundreds of paragraphs.
                </p>
                <p>
                  Instead of translating the whole page at once, the engine only targets the main content area:
                  navigation menus, sidebars, footers and other chrome are detected and skipped automatically.
                  Dynamic content is handled by a mutation observer, so newly loaded posts and comments get
                  translated in the background without interrupting the reader.
                </p>

                <blockquote>
                  The only way to do great work is to love what you do. If you have not found it yet, keep
                  looking and never settle. As with all matters of the heart, you will know when you find it.
                </blockquote>

                <h2>Getting Started</h2>
                <p>
                  Install the extension from the store, open any article page and press the translate button.
                  The engine detects the main content container, extracts every paragraph and renders the
                  translation right below the original text. You can switch between bilingual and target-only
                  display modes at any time.
                </p>

                <!-- ==================== table ==================== -->
                <h2>Supported Languages</h2>
                <table class="lang-table">
                  <thead>
                    <tr><th>Language</th><th>Difficulty</th><th>Native Speakers</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>Mandarin Chinese</td><td>Very hard</td><td>Over one billion</td></tr>
                    <tr><td>English</td><td>Medium</td><td>About one point five billion</td></tr>
                    <tr><td>Japanese</td><td>Very hard</td><td>About one hundred and twenty five million</td></tr>
                  </tbody>
                </table>

                <!-- ==================== code block ==================== -->
                <h2>Code Sample</h2>
                <p>Install the package with the following command in your terminal:</p>
                <pre>npm install qy-translate --save</pre>
                <p>Then import the module in your project entry file and start translating.</p>

                <!-- Live editor (CodeMirror/Sandpack playground): lines are
                     bare divs inside contenteditable + translate="no", with
                     NO code/pre ancestors — must never be translated -->
                <div class="cm-editor-live" role="textbox" translate="no">
                  <div class="cm-content" contenteditable="true" translate="no">
                    <div class="cm-line"><span>import</span> { useState } from 'react';</div>
                    <div class="cm-line">export default function MyComponent() { return &lt;div&gt;hello&lt;/div&gt; }</div>
                  </div>
                </div>

                <!-- CodeMirror/Sandpack style editor: lines are div.cm-line
                     inside pre>code and must never be translated -->
                <div class="sandpack sandpack--codeblock">
                  <div class="sp-wrapper">
                    <div class="sp-stack">
                      <div class="sp-code-editor">
                        <pre class="sp-cm sp-javascript"><code class="sp-pre-placeholder"><div class="cm-line"><span class="sp-syntax-keyword">function</span> <span class="sp-syntax-definition">MyButton</span>() {</div><div class="cm-line">  <span class="sp-syntax-keyword">return</span> (</div><div class="cm-line">    &lt;<span class="sp-syntax-tag">button</span>&gt;I am a button rendered inside a sandpack code block&lt;/<span class="sp-syntax-tag">button</span>&gt;</div><div class="cm-line">  );</div><div class="cm-line">}</div></code></pre>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- ==================== figure ==================== -->
                <figure>
                  <div class="placeholder-img">[Image placeholder]</div>
                  <figcaption>Architecture diagram of the page translation pipeline.</figcaption>
                </figure>

                <!-- ==================== mixed language ==================== -->
                <h2>Mixed Language Notes</h2>
                <p>
                  This paragraph is written entirely in English and should be translated into the target
                  language when the page is translated.
                </p>
                <p>
                  人工智能正在深刻改变我们的生活方式和工作方式。从驱动推荐系统的机器学习算法，到实现无缝沟通的
                  自然语言处理模型，AI 已经成为现代技术不可或缺的一部分。这段中文内容在目标语言为中文时应该被
                  识别为已经是目标语言，从而跳过翻译。
                </p>
                <p>
                  人工知能は、現代のテクノロジーにおいて最も重要な革新の一つです。機械学習と深層学習の進歩に
                  より、コンピューターは画像認識などの分野で大きな進歩を遂げています。日本語の段落は漢字の
                  割合が高いため、目标语言为中文时会被当作已翻译语言跳过。
                </p>
                <p>
                  This paragraph mixes English words and 中文 characters together to test the language detection
                  logic inside the filter, because the CJK ratio stays below the threshold and the text should
                  still be translated.
                </p>
              </article>

              <!-- ==================== sidebar ==================== -->
              <aside class="sidebar">
                <h3>Related Articles</h3>
                <ul>
                  <li>Ten tips for writing better browser extensions</li>
                  <li>Understanding the mutation observer API</li>
                  <li>How to keep your translations fast and accurate</li>
                </ul>
                <h3>Advertisement</h3>
                <div class="ad">Try our premium plan today with a thirty day free trial and full access to every feature.</div>
              </aside>

              <!-- ==================== card grid ==================== -->
              <section class="card-grid">
                <h2>Featured Products</h2>
                <div class="card">
                  <a class="card-title" href="#">Ergonomic Office Chair with Adjustable Lumbar Support</a>
                  <p>Designed for long working hours, this chair features breathable mesh fabric and a recline mechanism that adapts to your posture.</p>
                  <div class="summary">Free shipping on orders over fifty dollars within the continental United States.</div>
                </div>
                <div class="card">
                  <a class="card-title" href="#">Wireless Mechanical Keyboard with RGB Backlighting</a>
                  <p>Hot-swappable switches, low latency Bluetooth and a long battery life make this keyboard perfect for both work and gaming sessions.</p>
                  <div class="summary">Compatible with Windows, macOS, Android and iOS devices out of the box.</div>
                </div>
              </section>

              <!-- ==================== product card title link (Mercado Libre poly-card) ==================== -->
              <section class="poly-card-case">
                <h2>Product Card Title Link (poly-card)</h2>
                <div class="poly-card poly-card--grid poly-card--xlarge">
                  <div class="poly-card__portada">
                    <span class="poly-component__image-overlay"></span>
                    <img class="poly-component__picture" alt="Mochila Impermeable Antirrobos 35L Grande Capacidad Para Laptop 15.6&quot; Hombre Escolar Gris NOMARA" aria-hidden="true" data-testid="picture" loading="lazy" decoding="async" src="">
                  </div>
                  <div class="poly-card__content">
                    <a href="#" target="_self" class="poly-component__title">Mochila Impermeable Antirrobos 35L Grande Capacidad Para Laptop 15.6" Hombre Escolar Gris NOMARA</a>
                    <div class="poly-component__price">
                      <s class="andes-money-amount poly-price__previous" role="img" aria-label="Antes: 399 pesos mexicanos" aria-roledescription="Monto">
                        <span class="andes-money-amount__currency" aria-hidden="true"><span class="andes-money-amount__currency-symbol">$</span></span>
                        <span class="andes-money-amount__fraction" aria-hidden="true">399</span>
                      </s>
                      <div class="poly-price__current">
                        <span class="andes-money-amount poly-price__amount" role="img" aria-label="Ahora: 298 pesos mexicanos" aria-roledescription="Monto">
                          <span class="andes-money-amount__currency" aria-hidden="true"><span class="andes-money-amount__currency-symbol">$</span></span>
                          <span class="andes-money-amount__fraction" aria-hidden="true">298</span>
                        </span>
                        <span class="poly-price__disc-label" style="color: rgb(255, 255, 255); background-color: rgb(0, 166, 80);">25% OFF</span>
                      </div>
                    </div>
                    <div class="poly-component__shipping">
                      <span>Envío gratis</span>
                      <span class="poly-shipping__additional_text">por ser tu primera compra</span>
                    </div>
                  </div>
                </div>
              </section>

              <!-- ==================== faq accordion ==================== -->
              <section class="faq">
                <h2>Frequently Asked Questions</h2>
                <details open>
                  <summary><span>Question one: how long does it take to get started?</span></summary>
                  <p>Most teams are fully set up within an hour, including custom integrations with their existing stack.</p>
                </details>
                <details open>
                  <summary><span>Question two: do you offer enterprise plans?</span></summary>
                  <p>Yes, we have dedicated support, SSO and custom contracts for larger organizations.</p>
                </details>
              </section>

              <!-- ==================== journal tab widget (tandfonline) ==================== -->
              <!-- Journal/article sites wrap the whole article body in a tab widget:
                   div.tabs.tabs-widget > ul.tab-nav (tab bar) + div.tab-content >
                   div[role=tabpanel] (the real content pane). The pane must be
                   translated; the tab bar labels must stay untranslated; a hidden
                   pane (display:none) must stay untranslated. -->
              <section class="journal-tab-case">
                <h2>Journal Tab Widget (tabpanel content pane)</h2>
                <div class="tabs tabs-widget">
                  <div class="scroll-content">
                    <ul class="tab-nav container" aria-label="Article Information">
                      <li class="active"><a href="#" id="showFullText" class="show-full"><span class="nav-data">Full Article</span></a></li>
                      <li><a href="#" id="showFigure" class="show-figure"><span class="nav-data">Figures &amp; data</span></a></li>
                      <li><a href="#" id="showReferences" class="show-references"><span class="nav-data">References</span></a></li>
                    </ul>
                  </div>
                  <div class="tab-content">
                    <div id="mainTabPanel" class="tab tab-pane active" role="tabpanel">
                      <article class="article">
                        <div class="hlFld-Fulltext">
                          <div id="S0001" class="NLM_sec NLM_sec_level_1">
                            <h2 class="section-heading-2">1. Introduction</h2>
                            <p>The article body is rendered inside a tab content pane, which is the real content of the page and must always be translated by the page translation engine.</p>
                            <p>This second paragraph confirms that multiple paragraphs inside the tab panel are picked up as translatable candidates without being confused with the tab bar above.</p>
                          </div>
                        </div>
                      </article>
                    </div>
                    <div id="show-permissions" class="tab tab-pane" role="tabpanel" style="display:none">
                      <p>This hidden tab panel is not visible and must never be translated because the visibility check filters it out.</p>
                    </div>
                  </div>
                </div>
              </section>

              <!-- ==================== forum post (bare div with <br> children) ==================== -->
              <section class="forum-post">
                <h2>Forum Post (br-separated text in a bare div)</h2>
                <div class="content">Hello and welcome to our community forum.<br>
                <img src="images/smilies/icon_mrgreen.gif" alt=":mrgreen:">
                <br>
                This post body is rendered as raw text nodes separated by line breaks instead of paragraph elements, which is the classic phpBB layout.<br>
                We hope you enjoy your stay and introduce yourself to the other members.<br>
                <br>
                Best regards from the moderation team.</div>
              </section>

              <!-- ==================== bare div dedup (div in td/li + link box) ==================== -->
              <section class="div-dedup">
                <h2>Bare Div Deduplication</h2>

                <!-- div inside td: td is extracted, the div must be duplicate-of-ancestor -->
                <table class="dedup-table">
                  <tbody>
                    <tr>
                      <td><div>Dashboard metric description rendered inside a bare div within a table cell, which is common in admin consoles and email HTML.</div></td>
                    </tr>
                  </tbody>
                </table>

                <!-- div inside li: li is extracted, the div must be duplicate-of-ancestor -->
                <ul>
                  <li><div>List item body rendered as a bare div child of the list item, which must not be translated twice by the extraction rules.</div></li>
                </ul>

                <!-- GitHub markdown list item <li><p dir="auto">…</p></li>:
                     BOTH the li and its inner p are TARGET_TAGS — the li is the
                     text unit and the inner p must be duplicate-of-ancestor
                     (the site-rule path missed this dedup; the generic path
                     keeps the li only) -->
                <ul class="github-list">
                  <li><p>Markdown list items wrap their text in a paragraph element, so both the list item and the paragraph qualify as candidates and only the outer one must be translated.</p></li>
                </ul>

                <!-- link box: div with only link children → NOT a text container
                     (2026-08): each link is extracted separately instead of
                     the whole block merging into one paragraph -->
                <div class="link-box">
                  <a href="#">Understanding how the translation pipeline processes long documents efficiently</a>
                  <a href="#">Measuring the performance impact of dynamic content observation strategies</a>
                </div>
              </section>

              <!-- ==================== edge cases ==================== -->
              <section class="edge-cases">
                <h2>Edge Cases</h2>
                <p class="scenario-note">Hidden, non-content and non-translatable text lives below — these should all be filtered.</p>

                <p style="display:none">This paragraph is hidden with display none and must be skipped.</p>
                <p style="visibility:hidden">This paragraph is hidden with visibility hidden and must be skipped.</p>
                <div aria-hidden="true"><p>This paragraph sits inside an aria-hidden container and must be skipped.</p></div>
                <div role="dialog"><p>Dialog content that should be skipped as well.</p></div>
                <div role="toolbar"><p>Toolbar label that is not page content.</p></div>

                <!-- standalone tab button (no tablist ancestor): role=tab is UI chrome and must be skipped -->
                <a role="tab" href="#">Sort by relevance</a>
                <!-- tooltip: transient UI hint on a candidate tag, must be skipped -->
                <p role="tooltip">Shows the latest statistics for your account dashboard.</p>
                <li role="menuitem">Archive this conversation</li>

                <p>A</p>
                <p>42</p>
                <p>2026-01-01 12:30</p>
                <p>https://example.com/docs/guide</p>
                <p>---</p>
                <p>This sentence is long enough and should be extracted normally by the filtering rules.</p>

                <div class="long-text-wrap">
                  <p>{{ longText }}</p>
                </div>
              </section>

              <!-- ==================== TikTok video page (comment sidebar) ==================== -->
              <!-- TikTok renders the video in <article> and the comment list in a
                   bare <aside> (no role attribute; its implicit ARIA role is
                   complementary). Since 2026-08 the full-page scan translates
                   complementary/aside content too; short comment texts (< 30 chars)
                   are added by the TikTok site rule (supplemental), which the Rule
                   Lab doesn't run — the short comment below is expected to show
                   text-too-short here. Single-link sidebar items (TikTok /
                   Following / Explore) are NOT caught by the link-density heuristic
                   (it requires >= 2 links per container) and ARE extracted when the
                   target language differs — a known full-page-scan trade-off. -->
              <section class="tiktok-case">
                <h2>TikTok Video Page (comment sidebar)</h2>
                <div class="tiktok-sider">
                  <ul>
                    <li><a href="#">TikTok</a></li>
                    <li><a href="#">Following</a></li>
                    <li><a href="#">Explore</a></li>
                  </ul>
                </div>
                <article class="tiktok-video">
                  <div class="tiktok-caption">The most magical place I have ever seen in my entire life</div>
                  <strong data-e2e="like-count">2.1M</strong>
                  <strong data-e2e="comment-count">4638</strong>
                </article>
                <aside class="tiktok-comment-panel">
                  <div data-e2e="comment-item">
                    <div data-e2e="comment-username-1"><a href="#"><p>stellyt0020</p></a></div>
                    <span data-e2e="comment-level-1"><span class="TUXText">So beautiful, I would love to visit this waterfall town someday</span></span>
                  </div>
                  <div data-e2e="comment-item">
                    <div data-e2e="comment-username-1"><a href="#"><p>traveller_77</p></a></div>
                    <span data-e2e="comment-level-1"><span class="TUXText">Wow amazing place</span></span>
                  </div>
                </aside>
              </section>
            </main>

            <!-- ==================== footer ==================== -->
            <footer class="site-footer">
              <p>Copyright 2026 QY Translate. All rights reserved worldwide.</p>
            </footer>
          </div>
        </div>
      </div>

      <!-- ===== Decision table ===== -->
      <div class="lab-table-pane">
        <div class="pane-title">Decisions ({{ visibleDecisions.length }})</div>
        <div class="lab-table-scroll">
          <table class="lab-table">
            <thead>
              <tr><th>#</th><th>tag</th><th>text</th><th>result</th><th>reason</th></tr>
            </thead>
            <tbody>
              <tr
                v-for="(d, i) in visibleDecisions"
                :key="i"
                :class="{ selected: selected === d }"
                @click="selectDecision(d)"
              >
                <td class="cell-idx">{{ i + 1 }}</td>
                <td class="cell-tag">{{ d.tag }}</td>
                <td class="cell-text" :title="d.text">{{ truncate(d.text, 42) }}</td>
                <td class="cell-result">
                  <span :class="d.extracted ? 'badge ok' : 'badge no'">{{ d.extracted ? '✓' : '✗' }}</span>
                </td>
                <td class="cell-reason">{{ reasonLabel(d.reason) }}</td>
              </tr>
            </tbody>
          </table>
          <div v-if="visibleDecisions.length === 0" class="empty-hint">
            No decisions — run the page first.
          </div>
        </div>
      </div>
    </div>

    <!-- ===== Detail panel ===== -->
    <div v-if="selected" class="lab-detail">
      <div class="detail-head">
        <span class="detail-title">Node detail — {{ selected.tag }} <span :class="selected.extracted ? 'badge ok' : 'badge no'">{{ selected.extracted ? 'extracted' : reasonLabel(selected.reason) }}</span></span>
        <button class="lab-btn small" @click="selected = null">✕</button>
      </div>
      <div class="detail-body">
        <div class="detail-metrics">
          <div class="metric"><span class="m-key">text length</span><span class="m-val">{{ detail?.textLength }}</span></div>
          <div class="metric"><span class="m-key">path</span><span class="m-val path">{{ detail?.path || '-' }}</span></div>
          <div class="metric"><span class="m-key">offsetParent</span><span class="m-val">{{ detail?.offsetParent === null ? 'null' : 'ok' }}</span></div>
          <div class="metric"><span class="m-key">display</span><span class="m-val">{{ detail?.display }}</span></div>
          <div class="metric"><span class="m-key">visibility</span><span class="m-val">{{ detail?.visibility }}</span></div>
          <div class="metric"><span class="m-key">rect</span><span class="m-val">{{ detail?.rect }}</span></div>
          <div class="metric"><span class="m-key">aria-hidden</span><span class="m-val">{{ detail?.ariaHidden }}</span></div>
          <div class="metric"><span class="m-key">link ratio</span><span class="m-val">{{ detail?.linkRatio }}</span></div>
          <div class="metric"><span class="m-key">avg link len</span><span class="m-val">{{ detail?.avgLinkLen }}</span></div>
          <div class="metric"><span class="m-key">max link len</span><span class="m-val">{{ detail?.maxLinkLen }}</span></div>
          <div class="metric"><span class="m-key">role</span><span class="m-val">{{ detail?.role || '-' }}</span></div>
          <div class="metric"><span class="m-key">target lang</span><span class="m-val">{{ targetLang }}</span></div>
        </div>
        <div class="detail-text" :title="selected.text">{{ selected.text }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import {
  FilterDecision,
  FilterReason,
  filterParagraphs,
} from '@/content/pageTrans/ruleFilter'

/** Paragraph above MAX_TEXT_LENGTH (5000 chars) → text-too-long */
const longText = 'The quick brown fox jumps over the lazy dog while testing paragraph length limits. '.repeat(120)

/* ---- State ---- */
const previewEl = ref<HTMLDivElement | null>(null)
const targetLang = ref('zh-CN')
const decisions = ref<FilterDecision[]>([])
const containerDesc = ref('(not run yet)')
const showExtracted = ref(true)
const showFiltered = ref(true)
const resultFilter = ref<'all' | 'extracted' | 'filtered'>('all')
const search = ref('')
const selected = ref<FilterDecision | null>(null)
const detail = ref<any>(null)

const extractedCount = computed(() => decisions.value.filter((d) => d.extracted).length)
const filteredCount = computed(() => decisions.value.length - extractedCount.value)

const filteredByReason = computed<Record<string, number>>(() => {
  const m: Record<string, number> = {}
  for (const d of decisions.value) {
    if (d.extracted) continue
    m[d.reason] = (m[d.reason] || 0) + 1
  }
  return m
})

const visibleDecisions = computed(() => {
  const q = search.value.trim().toLowerCase()
  return decisions.value.filter((d) => {
    if (resultFilter.value === 'extracted' && !d.extracted) return false
    if (resultFilter.value === 'filtered' && d.extracted) return false
    if (q && !d.text.toLowerCase().includes(q) && !d.tag.includes(q) && !d.reason.includes(q)) return false
    return true
  })
})

/* ---- Reason labels ---- */
const REASON_LABELS: Record<FilterReason, string> = {
  extracted: 'extracted',
  'non-content-area': 'non-content area',
  'already-processed': 'already processed',
  'skip-tag': 'excluded tag',
  'skip-role': 'excluded role',
  'not-visible': 'not visible',
  'text-too-short': 'text too short',
  'text-too-long': 'text too long',
  'digits-or-symbols': 'digits / symbols',
  'url-only': 'URL only',
  'target-lang': 'already target lang',
  'layout-container': 'layout container',
  'duplicate-of-ancestor': 'duplicate of ancestor',
  editable: 'editable region',
  'no-translate': 'translate=no',
}
function reasonLabel(r: FilterReason): string {
  return REASON_LABELS[r] || r
}
function shortReason(r: FilterReason): string {
  return reasonLabel(r).replace(' / ', '/').slice(0, 16)
}
function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n) + '…' : s
}

/* ---- Run the filter against the fixed test page DOM ---- */
function run() {
  selected.value = null
  detail.value = null
  if (!previewEl.value) return
  const root = previewEl.value
  containerDesc.value = '(full-page scan)'
  decisions.value = filterParagraphs(root, { targetLang: targetLang.value })
  applyMarks()
}

function describeNode(el: Element): string {
  const parts = [el.tagName.toLowerCase()]
  if (el.id) parts.push('#' + el.id)
  const cls = String(el.className || '').trim()
  if (cls) parts.push('.' + cls.split(/\s+/).join('.'))
  return parts.join('')
}

/* ---- Highlight marks ---- */
function applyMarks() {
  if (!previewEl.value) return
  const root = previewEl.value
  root.querySelectorAll('.qyt-lab-extracted, .qyt-lab-filtered, .qyt-lab-selected').forEach((el) => {
    el.classList.remove('qyt-lab-extracted', 'qyt-lab-filtered', 'qyt-lab-selected')
  })

  for (const d of decisions.value) {
    if (d.extracted && showExtracted.value) d.element.classList.add('qyt-lab-extracted')
    if (!d.extracted && showFiltered.value) d.element.classList.add('qyt-lab-filtered')
  }
  if (selected.value) selected.value.element.classList.add('qyt-lab-selected')
}

/* ---- Selection ---- */
function selectDecision(d: FilterDecision) {
  selected.value = d
  detail.value = buildDetail(d)
  try {
    d.element.scrollIntoView({ block: 'center', behavior: 'smooth' })
  } catch { /* ignore */ }
  applyMarks()
}

function buildDetail(d: FilterDecision) {
  const el = d.element
  let style: CSSStyleDeclaration | null = null
  try { style = window.getComputedStyle(el) } catch { /* ignore */ }

  // link-density metrics (mirrors isInNonContentArea layer 2)
  let linkRatio: string | null = null
  let avgLinkLen: string | null = null
  let maxLinkLen: string | null = null
  const parent = el.closest('li, p, h1, h2, h3, h4, h5, h6, td, th, div, section')
  if (parent && (parent.textContent || '').trim().length <= 300) {
    const links = parent.querySelectorAll('a, button')
    if (links.length >= 2) {
      let total = 0
      let max = 0
      links.forEach((a) => {
        const len = (a.textContent || '').trim().length
        total += len
        if (len > max) max = len
      })
      const totalTextLen = Math.max((parent.textContent || '').trim().length, 1)
      linkRatio = (total / totalTextLen).toFixed(2)
      avgLinkLen = (total / links.length).toFixed(1)
      maxLinkLen = String(max)
    }
  }

  // node path
  const pathParts: string[] = []
  let node: Element | null = el
  while (node && node !== previewEl.value) {
    pathParts.unshift(describeNode(node))
    node = node.parentElement
  }

  let rect = '-'
  try {
    const r = el.getBoundingClientRect()
    rect = `${Math.round(r.width)}×${Math.round(r.height)}`
  } catch { /* ignore */ }

  return {
    textLength: d.text.length,
    path: pathParts.join(' > '),
    offsetParent: (el as HTMLElement).offsetParent,
    display: style?.display ?? '-',
    visibility: style?.visibility ?? '-',
    rect,
    ariaHidden: el.closest('[aria-hidden="true"]') ? 'true' : 'false',
    linkRatio,
    avgLinkLen,
    maxLinkLen,
    role: el.getAttribute('role') || (el.closest('[role]')?.getAttribute('role') || null),
  }
}

/* ---- Init: run once the fixed page has rendered ---- */
onMounted(async () => {
  await nextTick()
  run()
})
</script>

<style scoped lang="scss">
.rule-lab {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  color: var(--xx-text-color-regular, #333);
  font-size: 13px;
}

/* ---- Toolbar ---- */
.lab-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--xx-border-color, #e5e5e5);
  background: var(--xx-background-color, #fff);
  flex-wrap: wrap;
}
.lab-label { font-size: 12px; color: var(--xx-text-color-secondary, #666); }
.lab-select,
.lab-input {
  height: 26px;
  border: 1px solid var(--xx-border-color, #ddd);
  border-radius: 4px;
  background: var(--xx-input-bg-color, #fff);
  color: var(--xx-text-color-regular, #333);
  padding: 0 6px;
  font-size: 12px;
  outline: none;
}
.lang-select { width: 90px; }
.filter-select { width: 120px; }
.search-input { width: 180px; }
.toolbar-spacer { flex: 1; }

.lab-btn {
  height: 26px;
  border: 1px solid var(--xx-border-color, #ddd);
  border-radius: 4px;
  background: var(--xx-background-color, #fff);
  color: var(--xx-text-color-regular, #333);
  font-size: 12px;
  cursor: pointer;
  padding: 0 10px;
  &:hover { border-color: $mainColor; color: $mainColor; }
  &.primary {
    background: $mainColor;
    border-color: $mainColor;
    color: #fff;
    &:hover { opacity: 0.9; color: #fff; }
  }
  &.small { height: 22px; font-size: 11px; padding: 0 8px; }
}

.lab-check {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  cursor: pointer;
  user-select: none;
}

/* ---- Stats ---- */
.lab-stats {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 6px 14px;
  border-bottom: 1px solid var(--xx-border-color, #eee);
  font-size: 12px;
  flex-wrap: wrap;
  .stat { display: inline-flex; align-items: center; gap: 4px; }
  .total { color: var(--xx-text-color-regular, #333); font-weight: 600; }
  .extracted { color: #2ecc71; font-weight: 600; }
  .filtered { color: #e74c3c; font-weight: 600; }
  .container code {
    background: var(--xx-background-color-2, #f5f5f5);
    padding: 1px 5px;
    border-radius: 3px;
    font-size: 11px;
  }
  .reason-chip {
    background: rgba(231, 76, 60, 0.08);
    color: #c0392b;
    padding: 1px 6px;
    border-radius: 3px;
    font-size: 11px;
  }
}

/* ---- Main split ---- */
.lab-main {
  flex: 1;
  display: flex;
  min-height: 0;
}
.lab-preview-pane,
.lab-table-pane {
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.lab-preview-pane { flex: 1; border-right: 1px solid var(--xx-border-color, #eee); }
.lab-table-pane { width: 430px; flex-shrink: 0; }

.pane-title {
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--xx-text-color-secondary, #666);
  border-bottom: 1px solid var(--xx-border-color, #eee);
  background: var(--xx-background-color, #fff);
  flex-shrink: 0;
}
.lab-preview-scroll {
  flex: 1;
  overflow: auto;
  padding: 24px 16px;
  background: var(--xx-background-color-2, #fafafa);
}
.lab-table-scroll {
  flex: 1;
  overflow: auto;
}

/* ============================================================
   The fixed test page — this page IS the translation target
   ============================================================ */
.qyt-test-page {
  max-width: 860px;
  margin: 0 auto;
  background: #fff;
  border: 1px solid var(--xx-border-color, #ddd);
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  color: #333;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.7;
  font-size: 15px;
  overflow: hidden;

  .site-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 28px;
    border-bottom: 1px solid #eee;
    background: #fafbfc;
    .brand { font-size: 17px; font-weight: 700; color: #1a1a2e; }
    .main-nav ul {
      display: flex;
      gap: 18px;
      list-style: none;
      margin: 0;
      padding: 0;
      a { color: #4a5568; text-decoration: none; font-size: 14px; }
    }
  }

  .test-main {
    padding: 28px;
    display: flow-root;

    h1 { font-size: 26px; margin: 0 0 6px; color: #1a1a2e; }
    h2 { font-size: 20px; margin: 30px 0 10px; color: #16213e; border-bottom: 2px solid #e9ecef; padding-bottom: 6px; }
    h3 { font-size: 16px; margin: 20px 0 8px; color: #0f3460; }
    p { margin: 0 0 14px; }
    .post-meta { color: #8a94a6; font-size: 13px; }

    blockquote {
      border-left: 4px solid #4c8bf5;
      padding: 12px 20px;
      margin: 16px 0;
      background: #f8f9ff;
      color: #495057;
    }

    pre {
      background: #212529;
      color: #f8f9fa;
      padding: 14px 16px;
      border-radius: 6px;
      overflow-x: auto;
      font-size: 13px;
      margin: 0 0 14px;
    }

    .lang-table {
      width: 100%;
      border-collapse: collapse;
      margin: 0 0 14px;
      th, td { border: 1px solid #dee2e6; padding: 8px 12px; text-align: left; }
      th { background: #f1f3f5; font-weight: 600; }
    }

    .placeholder-img {
      height: 140px;
      background: #e9ecef;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      color: #6c757d;
    }
    figcaption { font-size: 13px; color: #6c757d; margin-top: 6px; }

    /* sidebar */
    .sidebar {
      float: right;
      width: 240px;
      margin: 0 0 16px 24px;
      padding: 14px 18px;
      background: #f7f9fc;
      border: 1px solid #e6eaf0;
      border-radius: 6px;
      font-size: 14px;
      ul { margin: 0 0 12px; padding-left: 18px; }
      li { margin-bottom: 4px; }
      .ad { font-size: 13px; color: #556; background: #fff; padding: 8px 10px; border-radius: 4px; }
    }

    /* card grid */
    .card-grid { clear: both; }
    .card {
      border: 1px solid #e6eaf0;
      border-radius: 8px;
      padding: 14px 18px;
      margin: 0 0 14px;
      .card-title { font-size: 16px; font-weight: 600; color: #2563eb; text-decoration: none; display: block; margin-bottom: 6px; }
      p { margin: 0 0 8px; }
      .summary { font-size: 13px; color: #667; background: #f8f9fa; padding: 6px 10px; border-radius: 4px; }
    }

    .faq p { margin-bottom: 10px; }
    .faq details {
      border: 1px solid #e6eaf0;
      border-radius: 6px;
      padding: 8px 14px;
      margin-bottom: 10px;
    }
    .faq summary {
      cursor: pointer;
      font-weight: 600;
      color: #1a1a2e;
      outline: none;
    }
    .faq summary::marker { color: #2563eb; }

    /* edge cases */
    .edge-cases {
      margin-top: 26px;
      padding: 14px 18px;
      border: 1px dashed #cbd5e1;
      border-radius: 8px;
      background: #fbfcfe;
      .scenario-note { font-size: 13px; color: #64748b; font-style: italic; }
      .long-text-wrap { max-height: 140px; overflow: hidden; position: relative; }
      .long-text-wrap::after {
        content: '';
        position: absolute;
        left: 0; right: 0; bottom: 0;
        height: 40px;
        background: linear-gradient(transparent, #fbfcfe);
        pointer-events: none;
      }
    }
  }

  .site-footer {
    padding: 12px 28px;
    border-top: 1px solid #eee;
    background: #fafbfc;
    color: #8a94a6;
    font-size: 13px;
    p { margin: 0; }
  }
}

/* ---- highlight marks on the test page ---- */
:deep(.qyt-lab-extracted) {
  outline: 2px solid #2ecc71;
  outline-offset: 1px;
  background: rgba(46, 204, 113, 0.10);
  border-radius: 2px;
}
:deep(.qyt-lab-filtered) {
  outline: 2px solid #e74c3c;
  outline-offset: 1px;
  background: rgba(231, 76, 60, 0.06);
  border-radius: 2px;
}
:deep(.qyt-lab-selected) {
  box-shadow: 0 0 0 3px rgba(241, 196, 15, 0.75);
  outline-offset: 1px;
  border-radius: 2px;
}

/* ---- Table ---- */
.lab-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  th, td {
    border-bottom: 1px solid var(--xx-border-color, #f0f0f0);
    padding: 5px 8px;
    text-align: left;
    vertical-align: top;
  }
  th {
    position: sticky;
    top: 0;
    background: var(--xx-background-color, #fff);
    color: var(--xx-text-color-secondary, #666);
    font-weight: 600;
    z-index: 1;
  }
  tbody tr { cursor: pointer; }
  tbody tr:hover { background: var(--xx-background-color-2, #f7f7f7); }
  tbody tr.selected { background: rgba(241, 196, 15, 0.14); }
  .cell-idx { color: var(--xx-text-color-secondary, #999); width: 30px; }
  .cell-tag { font-family: Menlo, Consolas, monospace; width: 52px; color: #8e44ad; }
  .cell-text { max-width: 190px; }
  .cell-result { width: 34px; }
  .cell-reason { color: var(--xx-text-color-secondary, #777); width: 120px; }
}
.badge {
  display: inline-block;
  padding: 0 5px;
  border-radius: 3px;
  font-size: 11px;
  line-height: 16px;
  &.ok { background: rgba(46, 204, 113, 0.15); color: #27ae60; }
  &.no { background: rgba(231, 76, 60, 0.12); color: #e74c3c; }
}
.empty-hint { padding: 20px; color: var(--xx-text-color-secondary, #999); text-align: center; }

/* ---- Detail panel ---- */
.lab-detail {
  border-top: 1px solid var(--xx-border-color, #ddd);
  background: var(--xx-background-color, #fff);
  max-height: 180px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}
.detail-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  border-bottom: 1px solid var(--xx-border-color, #eee);
  font-size: 12px;
  font-weight: 600;
  .detail-title { display: inline-flex; align-items: center; gap: 8px; }
}
.detail-body { display: flex; gap: 16px; padding: 8px 12px; min-height: 0; overflow: auto; }
.detail-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(120px, auto));
  gap: 4px 18px;
  flex-shrink: 0;
  .metric { display: flex; flex-direction: column; font-size: 11px; }
  .m-key { color: var(--xx-text-color-secondary, #888); }
  .m-val { font-family: Menlo, Consolas, monospace; color: var(--xx-text-color-regular, #333); }
  .m-val.path { max-width: 260px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
}
.detail-text {
  flex: 1;
  font-size: 12px;
  line-height: 1.6;
  color: var(--xx-text-color-regular, #333);
  background: var(--xx-background-color-2, #f7f7f7);
  border-radius: 4px;
  padding: 6px 8px;
  align-self: start;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
