import {ref, watch} from 'vue'

interface IUseDarkOptions {
    storageKey?: string
    onChange?: (isDark:boolean) => void
}

declare type mode_value = 'auto'|'auto_light'|'auto_dark'|'dark'|'light'

const modeValueList = ['auto','auto_light','auto_dark','dark','light']

const isDark = ref(false)

export const useDark = (options:IUseDarkOptions = {}) => {
    const {
        storageKey = 'xx-color-scheme'
    } = options

    let isColorSchemeChange = false
    const mode = ref<mode_value>('auto')

    const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const initColorSchemeMode = () => {
        chrome.storage.sync.get(storageKey, (v:any) => {
            const stroageMode = v[storageKey]
            if (modeValueList.includes(stroageMode)) {
                mode.value = stroageMode
            } else {
                mode.value = 'auto'
            }
            if (mode.value === 'auto') {
                if (colorSchemeQuery.matches) {
                    isDark.value = true
                } else {
                    isDark.value = false
                }
            } else {
                if (mode.value.includes('dark')) {
                    isDark.value = true
                } else {
                    isDark.value = false
                }
            }
        })
    }

    const setColorSchemeFromStorage = (value:mode_value) => {
        const d = <any>{}
        d[storageKey] = value
        chrome.storage.sync.set(d)
    }

    initColorSchemeMode()

    watch(() => isDark.value, (v:boolean) => {
        if (isColorSchemeChange) {
            if (v) {
                mode.value = 'auto_dark'
            } else {
                mode.value = 'auto_light'
            }
        } else {
            if (v) {
                mode.value = 'dark'
            } else {
                mode.value = 'light'
            }
        }
        isColorSchemeChange = false
        setColorSchemeFromStorage(mode.value)
        options.onChange && options.onChange(isDark.value)
    })

    colorSchemeQuery.addEventListener('change', (e:any) => {
        if (e.target?.matches) {
            isDark.value = true
        } else {
            isDark.value = false
        }
        isColorSchemeChange = true
        options.onChange && options.onChange(isDark.value)
    })

    return {isDark, mode}
}