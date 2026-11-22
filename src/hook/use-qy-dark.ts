import {useDark} from '@/xxuse/useDark'
import { ref, watch } from 'vue'
import { eventToGoogle } from '@/utils/analytics'

export const themeClassDark = 'xx-qy-style-dark'
export const themeClassLight = 'xx-qy-style-light'

export const useQyDarkWithChangeToBody = () => {
    const {isDark, mode, setMode} = useDark()
    watch(isDark, (dark, previous) => {
        document.body.className = dark ? themeClassDark : themeClassLight
        if (previous !== undefined) {
            eventToGoogle({
                name: 'change_theme',
                params: {mode: mode.value}
            })
        }
    }, { immediate: true })

    return { mode, setMode }
}

export const useQyDarkWithClassNames = (className:string) :any => {
    const {isDark} = useDark()

    const classNames = ref('')
    if (isDark.value) {
        classNames.value = `${className} ${themeClassDark}`
    } else {
        classNames.value = `${className} ${themeClassLight}`
    }
    watch(() => isDark.value, (isDarkVal:boolean) => {
        if (isDarkVal) {
            classNames.value = `${className} ${themeClassDark}`
        } else {
            classNames.value = `${className} ${themeClassLight}`
        }
    })
    return {isDark, classNames}
}