import { ref, watch } from 'vue'
import {UpdateModelValue} from '../../consts/constants'
import { useZIndex } from '@/xxui/hook/useZIndex'

export function useDialog(props:any, emit:any) {
    const {nextZIndex} = useZIndex()

    const zIndexStyle = ref(`z-index:${nextZIndex()}`)
    const contentStyle = ref<any>({})
    if (props.width) {
        contentStyle.value.width = props.width
    }
    
    function handleSHow() {
        emit(UpdateModelValue, !props.modelValue)
    }
    
    watch(()=>props.modelValue, (val) => {
        if (val) {
            zIndexStyle.value = `z-index:${nextZIndex()}`
        }
    })

    return {
        zIndexStyle,
        contentStyle,
        handleSHow
    }
}