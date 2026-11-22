import { createGlobalState } from '@vueuse/core'
import { computed, ref } from 'vue'

export const themeModes = ['light', 'auto', 'dark'] as const
type ThemeMode = typeof themeModes[number]
const storageKey = 'xx-color-scheme'

export const useDark = createGlobalState(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const browserDark = ref(media.matches)
    const mode = ref<ThemeMode>('auto')

    function restore(value: unknown) {
        mode.value = value === 'dark' || value === 'light' ? value : 'auto'
    }
    function setMode(value: ThemeMode) {
        mode.value = value
        chrome.storage.sync.set({ [storageKey]: value })
    }

    chrome.storage.sync.get(storageKey, values => restore(values[storageKey]))
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'sync' && changes[storageKey]) restore(changes[storageKey].newValue)
    })
    media.addEventListener('change', event => {
        browserDark.value = event.matches
    })

    const isDark = computed(() => mode.value === 'auto' ? browserDark.value : mode.value === 'dark')
    return { isDark, mode, setMode }
})
