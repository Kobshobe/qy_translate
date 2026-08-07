<template>
  <div class="rule-lab">
    <!-- ===== Top control bar ===== -->
    <div class="lab-toolbar">
      <select v-model="currentId" class="lab-select fixture-select" @change="onSelectFixture">
        <optgroup label="Built-in fixtures">
          <option v-for="f in ALL_FIXTURES" :key="f.id" :value="f.id">{{ f.name }}</option>
        </optgroup>
        <optgroup v-if="customFixtures.length" label="Custom fixtures">
          <option v-for="f in customFixtures" :key="f.id" :value="f.id">{{ f.name }}</option>
        </optgroup>
        <option value="__new__" class="new-option">+ New custom fixture…</option>
      </select>

      <label class="lab-label">Target lang</label>
      <select v-model="targetLang" class="lab-select lang-select">
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

      <select v-model="resultFilter" class="lab-select filter-select" @change="applyMarks">
        <option value="all">all results</option>
        <option value="extracted">extracted only</option>
        <option value="filtered">filtered only</option>
      </select>

      <input v-model="search" class="lab-input search-input" placeholder="search text / tag / reason…" />

      <button class="lab-btn" @click="exportJson">Export JSON</button>
      <label class="lab-btn file-btn">
        Import JSON
        <input type="file" accept="application/json,.json" style="display:none" @change="onImportJson" />
      </label>
    </div>

    <!-- ===== Stats bar ===== -->
    <div class="lab-stats">
      <span class="stat total">candidates: {{ decisions.length }}</span>
      <span class="stat extracted">extracted: {{ extractedCount }}</span>
      <span class="stat filtered">filtered: {{ filteredCount }}</span>
      <span class="stat container">main container: <code>{{ containerDesc }}</code></span>
      <span v-if="currentFixture && currentFixture.description" class="stat desc" :title="currentFixture.description">
        {{ currentFixture.description }}
      </span>
      <span v-for="(count, reason) in filteredByReason" :key="reason" class="stat reason-chip" :title="reasonLabel(reason)">
        {{ shortReason(reason) }}: {{ count }}
      </span>
    </div>

    <!-- ===== Editor (collapsible) ===== -->
    <div class="lab-editor">
      <button class="lab-btn small" @click="editorOpen = !editorOpen">
        {{ editorOpen ? '▾ Hide HTML editor' : '▸ Edit HTML' }}
      </button>
      <textarea
        v-if="editorOpen"
        v-model="html"
        class="lab-textarea"
        spellcheck="false"
        placeholder="Paste fixture HTML here…"
      ></textarea>
      <div v-if="editorOpen" class="editor-actions">
        <button class="lab-btn small" @click="run">Run edited HTML</button>
        <template v-if="isCustom">
          <button class="lab-btn small primary" @click="saveCustom">Save custom fixture</button>
          <button class="lab-btn small danger" @click="deleteCustom">Delete fixture</button>
        </template>
        <template v-else>
          <button class="lab-btn small" @click="saveAsCustom">Save as new custom fixture</button>
        </template>
      </div>
    </div>

    <!-- ===== Main split: preview + decision table ===== -->
    <div class="lab-main">
      <!-- Preview -->
      <div class="lab-preview-pane">
        <div class="pane-title">Preview</div>
        <div class="lab-preview-scroll">
          <div ref="previewEl" class="qyt-lab-preview"></div>
        </div>
      </div>

      <!-- Decision table -->
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
            No decisions — run a fixture first.
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
import { ref, computed, onMounted } from 'vue'
import { ALL_FIXTURES, RuleFixture } from '@/content/pageTrans/fixtures'
import {
  FilterDecision,
  FilterReason,
  filterParagraphs,
  findMainContentContainer,
} from '@/content/pageTrans/ruleFilter'

const STORAGE_KEY = 'ruleLabCustomFixtures'

/* ---- State ---- */
const previewEl = ref<HTMLDivElement | null>(null)
const currentId = ref(ALL_FIXTURES[0].id)
const html = ref(ALL_FIXTURES[0].html)
const targetLang = ref('zh-CN')
const decisions = ref<FilterDecision[]>([])
const containerDesc = ref('(not run yet)')
const customFixtures = ref<RuleFixture[]>([])
const showExtracted = ref(true)
const showFiltered = ref(true)
const resultFilter = ref<'all' | 'extracted' | 'filtered'>('all')
const search = ref('')
const editorOpen = ref(false)
const selected = ref<FilterDecision | null>(null)
const detail = ref<any>(null)

const currentFixture = computed<RuleFixture | null>(() =>
  ALL_FIXTURES.find((f) => f.id === currentId.value) ||
  customFixtures.value.find((f) => f.id === currentId.value) || null
)
const isCustom = computed(() =>
  customFixtures.value.some((f) => f.id === currentId.value)
)

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

/* ---- Sanitize fixture HTML ---- */
function sanitizeHtml(raw: string): string {
  return raw
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
}

/* ---- Run the filter ---- */
function run() {
  selected.value = null
  detail.value = null
  if (!previewEl.value) return
  previewEl.value.innerHTML = sanitizeHtml(html.value)
  const root = previewEl.value
  const container = findMainContentContainer(root)
  containerDesc.value = container ? describeNode(container) : '(body fallback)'
  decisions.value = filterParagraphs(container || root, { targetLang: targetLang.value })
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
  // clear previous marks
  root.querySelectorAll('.qyt-lab-extracted, .qyt-lab-filtered, .qyt-lab-selected').forEach((el) => {
    el.classList.remove('qyt-lab-extracted', 'qyt-lab-filtered', 'qyt-lab-selected')
  })
  if (selected.value) selected.value.element.classList.remove('qyt-lab-selected')

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

/* ---- Fixture selection ---- */
function onSelectFixture() {
  if (currentId.value === '__new__') {
    newCustomFixture()
    return
  }
  const f = currentFixture.value
  if (f) {
    html.value = f.html
    editorOpen.value = false
    run()
  }
}

function newCustomFixture() {
  const f: RuleFixture = {
    id: 'custom-' + Date.now(),
    name: 'Custom fixture ' + (customFixtures.value.length + 1),
    description: 'User-defined fixture',
    html: html.value,
  }
  customFixtures.value.push(f)
  currentId.value = f.id
  saveCustomFixtures()
  editorOpen.value = true
  run()
}

async function saveCustomFixtures() {
  try {
    // chrome.storage structured-clones Vue reactive arrays into plain objects;
    // persist a plain copy so it round-trips as a real array.
    const plain = customFixtures.value.map((f) => ({
      id: f.id,
      name: f.name,
      description: f.description,
      html: f.html,
    }))
    await chrome.storage.local.set({ [STORAGE_KEY]: plain })
  } catch { /* storage may be unavailable in dev server */ }
}

async function saveCustom() {
  const f = currentFixture.value
  if (!f) return
  f.html = html.value
  await saveCustomFixtures()
  run()
}

async function deleteCustom() {
  const idx = customFixtures.value.findIndex((f) => f.id === currentId.value)
  if (idx < 0) return
  customFixtures.value.splice(idx, 1)
  await saveCustomFixtures()
  currentId.value = ALL_FIXTURES[0].id
  html.value = ALL_FIXTURES[0].html
  run()
}

function saveAsCustom() {
  newCustomFixture()
}

/* ---- Export / Import ---- */
function exportJson() {
  const data = { version: 1, fixtures: [...ALL_FIXTURES, ...customFixtures.value] }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'rule-lab-fixtures.json'
  a.click()
  URL.revokeObjectURL(url)
}

async function onImportJson(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  try {
    const data = JSON.parse(await file.text())
    if (!Array.isArray(data.fixtures)) throw new Error('invalid format: missing "fixtures" array')
    const builtinIds = new Set(ALL_FIXTURES.map((f) => f.id))
    const imported = (data.fixtures as RuleFixture[]).filter((f) => !builtinIds.has(f.id))
    customFixtures.value = imported
    await saveCustomFixtures()
    if (imported.length > 0) {
      currentId.value = imported[0].id
      html.value = imported[0].html
      run()
    }
  } catch (err: any) {
    window.alert('Import failed: ' + err.message)
  }
}

/* ---- Init ---- */
async function init() {
  try {
    const res = await chrome.storage.local.get([STORAGE_KEY])
    const stored = res[STORAGE_KEY]
    customFixtures.value = Array.isArray(stored) ? stored : []
  } catch { /* ignore */ }
  run()
}

onMounted(init)
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
.fixture-select { min-width: 210px; }
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
  &.danger { color: #e74c3c; border-color: #e74c3c; &:hover { background: #e74c3c; color: #fff; } }
  &.small { height: 22px; font-size: 11px; padding: 0 8px; }
}
.file-btn { position: relative; overflow: hidden; }

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
  .desc { color: var(--xx-text-color-secondary, #888); max-width: 420px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .reason-chip {
    background: rgba(231, 76, 60, 0.08);
    color: #c0392b;
    padding: 1px 6px;
    border-radius: 3px;
    font-size: 11px;
  }
}

/* ---- Editor ---- */
.lab-editor {
  padding: 6px 14px;
  border-bottom: 1px solid var(--xx-border-color, #eee);
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-start;
}
.lab-textarea {
  width: 100%;
  height: 160px;
  border: 1px solid var(--xx-border-color, #ddd);
  border-radius: 4px;
  font-family: Menlo, Consolas, monospace;
  font-size: 12px;
  padding: 8px;
  box-sizing: border-box;
  resize: vertical;
  background: var(--xx-input-bg-color, #fff);
  color: var(--xx-text-color-regular, #333);
  outline: none;
}
.editor-actions { display: flex; gap: 8px; }

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
  padding: 16px;
  background: var(--xx-background-color-2, #fafafa);
}
.lab-table-scroll {
  flex: 1;
  overflow: auto;
}

/* ---- Preview content ---- */
.qyt-lab-preview {
  background: #fff;
  border: 1px solid var(--xx-border-color, #ddd);
  border-radius: 6px;
  padding: 20px 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  line-height: 1.7;
  color: #333;
}
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
