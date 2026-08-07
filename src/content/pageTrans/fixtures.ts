/**
 * Rule Lab fixtures — sample pages for testing the generic page-translation
 * filtering rules (src/content/pageTrans/ruleFilter.ts).
 *
 * Each fixture is a self-contained HTML fragment rendered inside a container.
 * `expectedExtracted` is the golden expectation: the trimmed textContent of
 * every node the filter should extract, in extraction order (target tags
 * first, then bare-text divs). Golden tests assert exact equality.
 */

export interface RuleFixture {
  id: string
  name: string
  description: string
  /** Fixture HTML (a self-contained page fragment; <script> is stripped by the lab) */
  html: string
  /** Golden expectation: extracted texts in extraction order */
  expectedExtracted?: string[]
  /** Target language used when running the filter (default 'zh-CN') */
  targetLang?: string
}

/* ============================================================
   Fixture content
   ============================================================ */

const LONG_TEXT = 'The quick brown fox jumps over the lazy dog while testing paragraph length limits. '.repeat(100)

export const ALL_FIXTURES: RuleFixture[] = [
  {
    id: 'basic-article',
    name: 'Basic article',
    description: 'Happy path: <main> with headings, paragraphs and a blockquote — all should be extracted.',
    expectedExtracted: [
      'Welcome to Our Documentation',
      'Artificial intelligence is transforming the way we live and work. From machine learning algorithms that power recommendation systems to natural language processing models that enable seamless communication, AI has become an integral part of modern technology.',
      'Getting Started',
      'This section explains how to set up the project on your machine and start translating pages in a few minutes. Follow the steps below and you will be up and running quickly.',
      'The only way to do great work is to love what you do. If you have not found it yet, keep looking and never settle.',
      'Research teams continue to push the boundaries of what machines can achieve, opening up new possibilities for innovation across every industry.',
    ],
    html: `<main>
  <h1>Welcome to Our Documentation</h1>
  <p>Artificial intelligence is transforming the way we live and work. From machine learning algorithms that power recommendation systems to natural language processing models that enable seamless communication, AI has become an integral part of modern technology.</p>
  <h2>Getting Started</h2>
  <p>This section explains how to set up the project on your machine and start translating pages in a few minutes. Follow the steps below and you will be up and running quickly.</p>
  <blockquote>The only way to do great work is to love what you do. If you have not found it yet, keep looking and never settle.</blockquote>
  <p>Research teams continue to push the boundaries of what machines can achieve, opening up new possibilities for innovation across every industry.</p>
</main>`,
  },

  {
    id: 'nav-sidebar-footer',
    name: 'Nav / sidebar / footer',
    description: 'Non-content areas inside <main>: nav links, sidebar list and footer text must be excluded; article body extracted.',
    expectedExtracted: [
      'Deep Dive into the Page Translation Engine',
      'The page translation engine walks the DOM and extracts translatable paragraph nodes before sending them to the background translation service. It manages the status of every paragraph and controls concurrent translation with batching and throttling.',
      'Dynamic content is handled by a mutation observer: whenever new nodes are added to the page, the engine extracts and translates them in the background without interrupting the user.',
    ],
    html: `<main>
  <nav>
    <ul>
      <li>Home</li>
      <li>About</li>
      <li>Products</li>
      <li>Contact</li>
    </ul>
  </nav>
  <aside class="sidebar">
    <h3>Related Articles</h3>
    <ul>
      <li>Ten tips for writing better code</li>
      <li>Understanding the rendering pipeline</li>
    </ul>
  </aside>
  <article>
    <h1>Deep Dive into the Page Translation Engine</h1>
    <p>The page translation engine walks the DOM and extracts translatable paragraph nodes before sending them to the background translation service. It manages the status of every paragraph and controls concurrent translation with batching and throttling.</p>
    <p>Dynamic content is handled by a mutation observer: whenever new nodes are added to the page, the engine extracts and translates them in the background without interrupting the user.</p>
  </article>
  <footer><p>Copyright 2026 QY Translate. All rights reserved.</p></footer>
</main>`,
  },

  {
    id: 'link-density-nav',
    name: 'Link-density nav',
    description: 'A div-based menu without semantic nav tags must be excluded by the link-density heuristic; real content still extracted.',
    expectedExtracted: [
      'Welcome to our website where we offer high quality products at affordable prices for customers all around the world.',
    ],
    html: `<div class="menu-list">
  <a href="#">Home</a>
  <a href="#">Products</a>
  <a href="#">Services</a>
  <a href="#">Blog</a>
  <a href="#">Contact</a>
</div>
<div class="intro">
  <p>Welcome to our website where we offer high quality products at affordable prices for customers all around the world.</p>
</div>`,
  },

  {
    id: 'card-grid',
    name: 'Card grid',
    description: 'Modern card/feed layout: <a> titles, <p> descriptions and bare-text <div> summaries — all extracted.',
    expectedExtracted: [
      'Featured Products',
      'Ergonomic Office Chair with Adjustable Lumbar Support',
      'Designed for long working hours, this chair features breathable mesh fabric and a recline mechanism that adapts to your posture.',
      'Wireless Mechanical Keyboard with RGB Backlighting',
      'Hot-swappable switches, low latency Bluetooth and a long battery life make this keyboard perfect for both work and gaming sessions.',
      'Free shipping on orders over fifty dollars within the continental United States.',
      'Compatible with Windows, macOS, Android and iOS devices out of the box.',
    ],
    html: `<main>
  <h1>Featured Products</h1>
  <div class="card">
    <a class="card-title" href="/product/1">Ergonomic Office Chair with Adjustable Lumbar Support</a>
    <p>Designed for long working hours, this chair features breathable mesh fabric and a recline mechanism that adapts to your posture.</p>
    <div class="summary">Free shipping on orders over fifty dollars within the continental United States.</div>
  </div>
  <div class="card">
    <a class="card-title" href="/product/2">Wireless Mechanical Keyboard with RGB Backlighting</a>
    <p>Hot-swappable switches, low latency Bluetooth and a long battery life make this keyboard perfect for both work and gaming sessions.</p>
    <div class="summary">Compatible with Windows, macOS, Android and iOS devices out of the box.</div>
  </div>
</main>`,
  },

  {
    id: 'bare-text-divs',
    name: 'Bare-text divs',
    description: 'React/Vue style: childless divs >= 30 chars are content; short divs (timestamps) and nested divs are not candidates.',
    expectedExtracted: [
      'Activity Feed',
      'This is a plain text block rendered by a JavaScript framework without any paragraph tags, but it is long enough to qualify as a translatable paragraph.',
      'Another bare text div with enough characters to be treated as page content and translated into the target language.',
      'Yet another paragraph of plain text that crosses the thirty character threshold so it gets extracted.',
    ],
    html: `<main>
  <h1>Activity Feed</h1>
  <div>This is a plain text block rendered by a JavaScript framework without any paragraph tags, but it is long enough to qualify as a translatable paragraph.</div>
  <div>Another bare text div with enough characters to be treated as page content and translated into the target language.</div>
  <div>3 min ago</div>
  <div><span>Nested text inside a span should not make the wrapper div a candidate.</span></div>
  <div>Yet another paragraph of plain text that crosses the thirty character threshold so it gets extracted.</div>
</main>`,
  },

  {
    id: 'table-content',
    name: 'Table content',
    description: 'th/td extracted; a td wrapping a nested table is a layout container, inner tds are independent text units.',
    expectedExtracted: [
      'Language Comparison',
      'Language',
      'Difficulty',
      'Speakers',
      'Mandarin Chinese',
      'Very Hard',
      'Over one billion',
      'English',
      'Medium',
      'About one point five billion',
      'Spanish',
      'Difficulty rating: easy for English speakers',
      'About six hundred million',
    ],
    html: `<main>
  <h2>Language Comparison</h2>
  <table>
    <thead>
      <tr><th>Language</th><th>Difficulty</th><th>Speakers</th></tr>
    </thead>
    <tbody>
      <tr><td>Mandarin Chinese</td><td>Very Hard</td><td>Over one billion</td></tr>
      <tr><td>English</td><td>Medium</td><td>About one point five billion</td></tr>
      <tr>
        <td>Spanish</td>
        <td>
          <table>
            <tr><td>Difficulty rating: easy for English speakers</td></tr>
          </table>
        </td>
        <td>About six hundred million</td>
      </tr>
    </tbody>
  </table>
</main>`,
  },

  {
    id: 'nested-duplicate',
    name: 'Nested duplicate',
    description: 'An <a> inside a <p> is a duplicate of its ancestor and must not be extracted twice; only the <p> is extracted.',
    expectedExtracted: [
      'Resource Center',
      'Visit the official documentation for detailed installation steps and troubleshooting guides.',
      'If you encounter any problems, please check the frequently asked questions before opening a support ticket.',
    ],
    html: `<main>
  <h2>Resource Center</h2>
  <p>Visit the <a href="https://example.com/docs">official documentation</a> for detailed installation steps and troubleshooting guides.</p>
  <p>If you encounter any problems, please check the <a href="https://example.com/faq">frequently asked questions</a> before opening a support ticket.</p>
</main>`,
  },

  {
    id: 'code-block',
    name: 'Code / script / style',
    description: 'pre, code, script and style must be skipped; surrounding prose extracted.',
    expectedExtracted: [
      'Installation Guide',
      'Install the package with the following command in your terminal:',
      'Then import the module in your project entry file:',
      'Finally run the build command and verify the output in your browser.',
    ],
    html: `<main>
  <h1>Installation Guide</h1>
  <p>Install the package with the following command in your terminal:</p>
  <pre>npm install my-translation-package --save</pre>
  <p>Then import the module in your project entry file:</p>
  <code>import { translate } from 'my-translation-package'</code>
  <p>Finally run the build command and verify the output in your browser.</p>
  <script>var hiddenValue = true;</script>
  <style>.fake-class { color: red; }</style>
</main>`,
  },

  {
    id: 'role-exclusion',
    name: 'ARIA role exclusion',
    description: 'Elements with excluded roles (navigation / dialog / toolbar) are skipped; article content extracted.',
    expectedExtracted: [
      'Main Article Heading',
      'This is the actual readable content of the page that should be extracted and translated into the target language.',
    ],
    html: `<main>
  <div role="navigation"><p>Navigation menu text that should never be translated.</p></div>
  <div role="dialog"><p>Dialog content that should be skipped as well.</p></div>
  <div role="toolbar"><p>Toolbar label that is not page content.</p></div>
  <article>
    <h1>Main Article Heading</h1>
    <p>This is the actual readable content of the page that should be extracted and translated into the target language.</p>
  </article>
</main>`,
  },

  {
    id: 'hidden-content',
    name: 'Hidden content',
    description: 'display:none, visibility:hidden and aria-hidden containers must be skipped; visible text extracted.',
    expectedExtracted: [
      'Visible Heading',
      'This paragraph is visible and should be translated normally by the engine.',
      'Another visible paragraph at the end that should be extracted without any trouble.',
    ],
    html: `<main>
  <h1>Visible Heading</h1>
  <p>This paragraph is visible and should be translated normally by the engine.</p>
  <p style="display:none">This paragraph is hidden with display none and must be skipped.</p>
  <p style="visibility:hidden">This paragraph is hidden with visibility hidden and must be skipped.</p>
  <div aria-hidden="true"><p>This paragraph sits inside an aria-hidden container and must be skipped.</p></div>
  <p>Another visible paragraph at the end that should be extracted without any trouble.</p>
</main>`,
  },

  {
    id: 'mixed-language',
    name: 'Mixed language',
    description: 'Target lang zh-CN: Chinese (and kanji-heavy Japanese) paragraphs are already-target-language and skipped; English and low-CJK-ratio text extracted.',
    targetLang: 'zh-CN',
    expectedExtracted: [
      'Mixed Language Article',
      'Artificial intelligence is transforming the world of technology today in many surprising ways.',
      'This final paragraph mixes English words and 中文 characters together to test the language detection logic inside the filter.',
    ],
    html: `<main>
  <h1>Mixed Language Article</h1>
  <p>Artificial intelligence is transforming the world of technology today in many surprising ways.</p>
  <p>人工知能は、現代のテクノロジーにおいて最も重要な革新の一つです。機械学習と深層学習の進歩により、コンピューターは画像認識などの分野で大きな進歩を遂げています。</p>
  <p>人工智能正在深刻改变我们的生活方式和工作方式。从驱动推荐系统的机器学习算法，到实现无缝沟通的自然语言处理模型，AI 已经成为现代技术不可或缺的一部分。</p>
  <p>This final paragraph mixes English words and 中文 characters together to test the language detection logic inside the filter.</p>
</main>`,
  },

  {
    id: 'short-digits-urls',
    name: 'Short / digits / URLs',
    description: 'Single-char text, pure digits, timestamps, pure URLs and pure punctuation must be filtered; real sentences extracted.',
    expectedExtracted: [
      'Edge Case Samples',
      'Hi',
      'This sentence is long enough and should be extracted normally by the filtering rules.',
    ],
    html: `<main>
  <h1>Edge Case Samples</h1>
  <p>A</p>
  <p>Hi</p>
  <p>42</p>
  <p>2026-01-01 12:30</p>
  <p>https://example.com/docs/guide</p>
  <p>---</p>
  <p>This sentence is long enough and should be extracted normally by the filtering rules.</p>
</main>`,
  },

  {
    id: 'long-text',
    name: 'Long text',
    description: 'A paragraph above MAX_TEXT_LENGTH (5000) is skipped; normal text still extracted.',
    expectedExtracted: [
      'Length Limit Testing',
      'This is a normal sized paragraph that should be extracted without any problem at all.',
    ],
    html: `<main>
  <h1>Length Limit Testing</h1>
  <p>This is a normal sized paragraph that should be extracted without any problem at all.</p>
  <p>${LONG_TEXT}</p>
</main>`,
  },

  {
    id: 'landing-page',
    name: 'Landing page (no main)',
    description: 'No <main>/<article>: hero/feature/faq sections split content, coverage check fails and the whole body is scanned; footer still excluded.',
    expectedExtracted: [
      'Build Faster with Our Platform',
      'Our platform helps engineering teams ship reliable products by automating the boring parts of development, from continuous integration to deployment pipelines and everything in between.',
      'Real-time Collaboration',
      'Work together with your team in real time, share feedback instantly and keep everyone aligned with built-in review tools that integrate with your existing workflow.',
      'Powerful Analytics',
      'Understand exactly how your users behave with detailed dashboards, funnels and retention reports that update live as new data streams in from your applications.',
      'Frequently Asked Questions',
      'Question one: how long does it take to get started? Most teams are fully set up within an hour, including custom integrations with their existing stack.',
      'Question two: do you offer enterprise plans? Yes, we have dedicated support, SSO and custom contracts for larger organizations.',
    ],
    html: `<section class="hero">
  <h1>Build Faster with Our Platform</h1>
  <p>Our platform helps engineering teams ship reliable products by automating the boring parts of development, from continuous integration to deployment pipelines and everything in between.</p>
</section>
<section class="feature">
  <h2>Real-time Collaboration</h2>
  <p>Work together with your team in real time, share feedback instantly and keep everyone aligned with built-in review tools that integrate with your existing workflow.</p>
</section>
<section class="feature">
  <h2>Powerful Analytics</h2>
  <p>Understand exactly how your users behave with detailed dashboards, funnels and retention reports that update live as new data streams in from your applications.</p>
</section>
<section class="faq">
  <h2>Frequently Asked Questions</h2>
  <p>Question one: how long does it take to get started? Most teams are fully set up within an hour, including custom integrations with their existing stack.</p>
  <p>Question two: do you offer enterprise plans? Yes, we have dedicated support, SSO and custom contracts for larger organizations.</p>
</section>
<footer><p>Copyright 2026 Example Platform Inc. All rights reserved worldwide.</p></footer>`,
  },

  {
    id: 'article-card-vs-body',
    name: 'Article vs card container',
    description: 'A small <div class="card"> is not a body container; the content-rich <article> is chosen as the main container and only its text is extracted.',
    expectedExtracted: [
      'Blog Post Title Goes Here',
      'This is the first long paragraph of the blog post. It explains the background of the topic and gives readers the context they need before diving into the details, all while remaining readable and natural.',
      'The second paragraph covers the main argument with concrete examples and references, making the case for why the approach described in this article works in practice.',
      'Finally, the conclusion summarizes the key takeaways and suggests further reading for anyone who wants to explore the subject in more depth.',
    ],
    html: `<div class="card">
  <h2>Quick Card Title</h2>
  <p>Short card description text that accompanies the product card in the grid layout.</p>
</div>
<article>
  <h1>Blog Post Title Goes Here</h1>
  <p>This is the first long paragraph of the blog post. It explains the background of the topic and gives readers the context they need before diving into the details, all while remaining readable and natural.</p>
  <p>The second paragraph covers the main argument with concrete examples and references, making the case for why the approach described in this article works in practice.</p>
  <p>Finally, the conclusion summarizes the key takeaways and suggests further reading for anyone who wants to explore the subject in more depth.</p>
</article>`,
  },
  {
    id: 'faq-accordion',
    name: 'FAQ accordion',
    description: '<details>/<summary> collapsible: the visible question in <summary> (with a nested <span>) is extracted; answers <p> extracted.',
    expectedExtracted: [
      'Frequently Asked Questions',
      'Does the recipient need to accept crypto?',
      'No. The recipient never touches crypto. They receive a standard local bank transfer in their own currency, exactly as they would from any other payment.',
      'Do I need a bank account to use TrustLinq?',
      'No. TrustLinq does not require you to hold a bank account. You fund payments directly from your own crypto wallet and TrustLinq settles the payment on your behalf.',
    ],
    html: `<main>
  <h2>Frequently Asked Questions</h2>
  <details class="faq__item" open>
    <summary class="faq__question"><span>Does the recipient need to accept crypto?</span></summary>
    <p>No. The recipient never touches crypto. They receive a standard local bank transfer in their own currency, exactly as they would from any other payment.</p>
  </details>
  <details class="faq__item" open>
    <summary class="faq__question"><span>Do I need a bank account to use TrustLinq?</span></summary>
    <p>No. TrustLinq does not require you to hold a bank account. You fund payments directly from your own crypto wallet and TrustLinq settles the payment on your behalf.</p>
  </details>
</main>`,
  },
]
