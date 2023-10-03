import { ref, computed, Ref, nextTick } from "vue"
import {createPopper} from '@popperjs/core'
import { useZIndex } from "../../hook/useZIndex"

export const useDropdown = (props:any, referenceRef:Ref<Element>, dropdownRef:Ref<HTMLElement>) :any => {
    const {nextZIndex} = useZIndex()

    const isShowTip = ref(false)
    const zIndex = ref(``)

    const popperInstance = computed(() => {
        return createPopper(referenceRef.value, dropdownRef.value, {
            placement: props.placement,
            modifiers: [
                {
                    name: 'offset',
                    options: {
                        offset: [0, -1]
                    }
                }
            ],
            strategy: 'absolute',
        })
    })

    const handleShow = () => {
        if (!isShowTip.value) {
            zIndex.value = `z-index:${nextZIndex()}`
            isShowTip.value = true
            nextTick(() => {
                popperInstance.value.update()
            })
        }
    }

    const handleHide = () => {
        isShowTip.value = false
    }

    return {
        isShowTip,
        handleHide,
        handleShow,
        zIndex
    }
}