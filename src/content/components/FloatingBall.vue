<template>
  <ThemeElement>
    <button
    v-show="showBall"
    id="qyt-floating-ball"
    ref="ballRef"
    :class="['qyt-fb-ball', sideClass, { 'qyt-fb-dragging': isDragging }]"
    :style="ballStyle"
    @click.prevent="onClick"
    @mousedown.prevent="onDragStart"
  >
    <img
      :src="logoUrl"
      alt="QY Translate"
      draggable="false"
      class="qyt-fb-logo"
    />
    <img
      v-show="showFinishBadge"
      :src="finishUrl"
      alt="done"
      draggable="false"
      class="qyt-fb-finish"
    />
    <span class="qyt-fb-tip">{{ titleText }}</span>
    <button
      class="qyt-fb-settings"
      :title="settingsTitle"
      @click.stop="openSettings"
    >
      <SvgIcon type="icon-shezhi" :size="12" color="currentColor" />
    </button>
  </button>
  </ThemeElement>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue'
import { PageTransEngine } from '../pageTrans/pageTransEngine'
import ThemeElement from '@/components/base/ThemeElement.vue'
import SvgIcon from '@/components/base/SvgIcon.vue'

/* ============================================================
   Engine
   ============================================================ */
let engine: PageTransEngine | null = null

/* ============================================================
   Assets
   ============================================================ */
const logoUrl = chrome.runtime.getURL('assets/images/logo.png')
const finishUrl = chrome.runtime.getURL('assets/images/finish.svg')

/* ============================================================
   Reactive state
   ============================================================ */
const ballRef = ref<HTMLButtonElement | null>(null)
const isDragging = ref(false)
const visible = ref(true)
const side = ref<'left' | 'right'>('right')
const engineStatus = ref<string>('idle')

// Content script runs with all_frames: true, so ad/embedded iframes would each
// render their own ball overlapping the page. Only show the ball in the top window.
const isTopFrame = window.top === window.self

// Hide the floating ball while any element is in fullscreen (Fullscreen API)
const fullscreenHides = ref(false)
const showBall = computed(() => isTopFrame && visible.value && !fullscreenHides.value)

const ballStyle = reactive({
  left: 'auto',
  top: 'calc(50% - 18px)',
  right: '0px',
  bottom: 'auto',
  transform: 'none',
})

const toggling = ref(false)

/* ============================================================
   Computed properties
   ============================================================ */
const sideClass = computed(() => `qyt-fb-${side.value}`)

const titleText = computed(() => {
  switch (engineStatus.value) {
    case 'extracting':
    case 'translating':
      return chrome.i18n.getMessage('__translating__')
    case 'translated':
      return chrome.i18n.getMessage('__showOriginal__')
    case 'restoring':
      return chrome.i18n.getMessage('__restoring__')
    default:
      return chrome.i18n.getMessage('__pageTrans__')
  }
})

const showFinishBadge = computed(() => engineStatus.value === 'translated')

const settingsTitle = chrome.i18n.getMessage('__options__')

/* ============================================================
   Initialization
   ============================================================ */
let messageHandler: ((msg: any, sender: chrome.runtime.MessageSender) => void) | null = null

/* ============================================================
   Fullscreen detection
   ============================================================ */
function updateFullscreenState(): void {
  const el =
    document.fullscreenElement ||
    (document as Document & { webkitFullscreenElement: Element | null }).webkitFullscreenElement
  // Hide the ball when any element enters fullscreen (video/image/iframe/whole page, etc.)
  fullscreenHides.value = !!el
}

function onFullscreenChange(): void {
  updateFullscreenState()
}

onMounted(async () => {
  // Initialize only in the top window; skip iframes
  if (window.top !== window.self) return

  // Fullscreen API listeners (with Safari prefix fallback)
  document.addEventListener('fullscreenchange', onFullscreenChange)
  document.addEventListener('webkitfullscreenchange', onFullscreenChange)
  updateFullscreenState()

  engine = new PageTransEngine()
  engine.onStatusChange = (status) => {
    engineStatus.value = status
  }
  await engine.init()

  // Load floating ball config from storage
  const result = await chrome.storage.sync.get(['fbVisible', 'fbDefaultSide'])
  if (result.fbDefaultSide === 'left') {
    side.value = 'left'
    ballStyle.left = '0px'
    ballStyle.right = 'auto'
  }
  if (result.fbVisible === false) {
    visible.value = false
  }

  // Listen for storage changes
  chrome.storage.onChanged.addListener(storageChangeHandler)

  // Listen for messages from background (shortcuts, etc.)
  messageHandler = (msg, sender) => {
    if (sender.id !== chrome.runtime.id) return
    switch (msg.action) {
      case 'togglePageTrans':
        engine?.toggle(msg.engine)
        break
      case 'translatePage':
        engine?.extract()
        engine?.translate(msg.engine)
        break
      case 'restorePage':
        engine?.restore()
        break
    }
  }
  chrome.runtime.onMessage.addListener(messageHandler)
})

onUnmounted(() => {
  chrome.storage.onChanged.removeListener(storageChangeHandler)
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  document.removeEventListener('webkitfullscreenchange', onFullscreenChange)
  if (messageHandler) {
    chrome.runtime.onMessage.removeListener(messageHandler)
    messageHandler = null
  }
  engine?.destroy()
  engine = null
})

/* ============================================================
   Storage change listener
   ============================================================ */
function storageChangeHandler(
  changes: { [key: string]: chrome.storage.StorageChange },
  areaName: string
): void {
  if (areaName !== 'sync') return

  if (changes.fbVisible) {
    visible.value = changes.fbVisible.newValue !== false
  }

  if (changes.fbDefaultSide) {
    const newSide = changes.fbDefaultSide.newValue as 'left' | 'right'
    side.value = newSide
    if (newSide === 'left') {
      ballStyle.left = ballStyle.left || '0px'
      ballStyle.right = 'auto'
    } else {
      ballStyle.left = 'auto'
      ballStyle.right = ballStyle.right || '0px'
    }
  }

  // Style/mode config changes
  if (changes.pageTransStyle) {
    engine?.updateConfig({ transStyle: changes.pageTransStyle.newValue })
    engine?.renderEngine.applyStyle(changes.pageTransStyle.newValue)
  }
  if (changes.pageTransDisplayMode) {
    engine?.updateConfig({ displayMode: changes.pageTransDisplayMode.newValue })
    engine?.renderEngine.switchMode(changes.pageTransDisplayMode.newValue)
  }
  if (changes.pageTransDimOriginal) {
    engine?.renderEngine.applyDimOriginal(changes.pageTransDimOriginal.newValue)
  }
}

/* ============================================================
   Settings button
   ============================================================ */
function openSettings(): void {
  const port = chrome.runtime.connect({ name: 'openOptionsPage' })
  port.postMessage({ req: { type: 'floatingBall', hash: '#/settings/page-trans' } })
  port.disconnect()
}

/* ============================================================
   Click handling
   ============================================================ */
async function onClick(): Promise<void> {
  if (isDragging.value) {
    isDragging.value = false
    return
  }
  if (toggling.value) return
  toggling.value = true
  try {
    await engine?.toggle()
  } finally {
    toggling.value = false
  }
}

/* ============================================================
   Drag logic
   ============================================================ */
function onDragStart(e: MouseEvent): void {
  const ball = ballRef.value
  if (!ball) return

  isDragging.value = false
  const startX = e.clientX
  const startY = e.clientY
  const rect = ball.getBoundingClientRect()
  const offsetX = e.clientX - rect.left
  const offsetY = e.clientY - rect.top

  document.body.classList.add('qyt-fb-dragging-active')

  function onMove(ev: MouseEvent) {
    if (Math.abs(ev.clientX - startX) > 3 || Math.abs(ev.clientY - startY) > 3) {
      isDragging.value = true
    }
    ballStyle.left = `${ev.clientX - offsetX}px`
    ballStyle.top = `${ev.clientY - offsetY}px`
    ballStyle.right = 'auto'
    ballStyle.bottom = 'auto'
  }

  function onUp() {
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
    document.body.classList.remove('qyt-fb-dragging-active')
    snapToSide()
  }

  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}

/* ============================================================
   Snap to the nearest side
   ============================================================ */
function snapToSide(): void {
  const ball = ballRef.value
  if (!ball) return

  const rect = ball.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const viewportWidth = window.innerWidth

  if (centerX < viewportWidth / 2) {
    side.value = 'left'
    ballStyle.left = '0px'
    ballStyle.right = 'auto'
  } else {
    side.value = 'right'
    ballStyle.right = '0px'
    ballStyle.left = 'auto'
  }
  ballStyle.top = `${rect.top}px`
  ballStyle.transform = 'none'
}
</script>

<style lang="scss" scoped>
#qyt-floating-ball {
  all: initial;
  position: fixed;
  z-index: 2147483647;
  box-sizing: content-box;
  width: 36px;
  min-width: 36px;
  max-width: 36px;
  height: 36px;
  min-height: 36px;
  max-height: 36px;
  margin: 0;
  border: none;
  border-radius: 8px;
  background: var(--xx-background-color);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  opacity: 0.65;
  padding: 0;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  flex-shrink: 0;
  flex-grow: 0;
  line-height: 1;
  font-family: inherit;

  &:hover {
    opacity: 1;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
    transform: scale(1.05);

    .qyt-fb-tip {
      opacity: 1;
    }
  }
}

/* Snap left: remove left rounded corners */
#qyt-floating-ball.qyt-fb-left {
  border-radius: 0 8px 8px 0;
}

/* Snap right: remove right rounded corners */
#qyt-floating-ball.qyt-fb-right {
  border-radius: 8px 0 0 8px;
}

/* Dragging: disable transition */
#qyt-floating-ball.qyt-fb-dragging {
  transition: none !important;
  opacity: 0.9;
}

.qyt-fb-logo {
  all: initial;
  display: block;
  width: 24px;
  min-width: 24px;
  max-width: 24px;
  height: 24px;
  min-height: 24px;
  max-height: 24px;
  margin: 0;
  padding: 0;
  border: none;
  pointer-events: none;
  border-radius: 5px;
  box-sizing: content-box;
}

.qyt-fb-finish {
  all: initial;
  position: absolute;
  right: 2px;
  bottom: 2px;
  width: 12px;
  min-width: 12px;
  max-width: 12px;
  height: 12px;
  min-height: 12px;
  max-height: 12px;
  margin: 0;
  padding: 0;
  border: none;
  pointer-events: none;
  box-sizing: content-box;
}

.qyt-fb-settings {
  all: initial;
  position: absolute;
  top: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  box-sizing: content-box;
  width: 28px;
  min-width: 28px;
  max-width: 28px;
  height: 28px;
  min-height: 28px;
  max-height: 28px;
  margin: 0;
  border-radius: 50%;
  border: none;
  background: var(--xx-background-color);
  color: var(--xx-c-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  opacity: 0;
  transition: opacity 0.2s ease;
  padding: 0;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  flex-shrink: 0;
  flex-grow: 0;
  line-height: 1;
  font-family: inherit;

  &:hover {
    background: var(--xx-c-primary);
    color: #fff;
  }
}

.qyt-fb-tip {
  all: initial;
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 8px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  font-size: 12px;
  line-height: 1.4;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 1;
}

#qyt-floating-ball:hover .qyt-fb-settings {
  opacity: 1;
}

#qyt-floating-ball.qyt-fb-dragging {
  .qyt-fb-settings,
  .qyt-fb-tip {
    opacity: 0 !important;
  }
}
</style>

<!-- Global style: prevent text selection while dragging -->
<style lang="scss">
body.qyt-fb-dragging-active {
  user-select: none !important;
  -webkit-user-select: none !important;
}
</style>
