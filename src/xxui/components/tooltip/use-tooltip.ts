import { ref, computed, Ref, nextTick } from "vue"
import {createPopper} from '@popperjs/core'
import { useZIndex } from "../../hook/useZIndex"

export const useTooltip = (props:any, referenceRef:Ref<Element>, tooltipRef:Ref<HTMLElement>) :any => {
    const {nextZIndex} = useZIndex()

    const isShowTip = ref(false)
    const zIndex = ref(``)

    const popperInstance = computed(() => {
        return createPopper(referenceRef.value, tooltipRef.value, {
            placement: props.placement,
            modifiers: [
                {
                    name: 'offset',
                    options: {
                        offset: [0, 10]
                    }
                }
            ],
            strategy: 'absolute',
        })
    })

    const handleShow = () => {
        zIndex.value = `z-index:${nextZIndex()}`
        isShowTip.value = true
        nextTick(() => popperInstance.value.update())
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