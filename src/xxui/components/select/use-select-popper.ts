import { SelectKey } from "@/xxui/consts/constants";
import { inject, onMounted, Ref, watch, toRefs, nextTick } from "vue";

export function useSelectPopper(popperContent:Ref<HTMLElement|undefined>, props:any) {
    const {isShowPopper, popperStyle, calcPopperGeometry, isEmpty} = toRefs(inject<any>(SelectKey))
    onMounted(() => {
        calcPopperGeometry.value(popperContent)
    })
    watch(isShowPopper, (v:boolean) => {
        if (v) {
            nextTick(() => {
                calcPopperGeometry.value(popperContent)
            })
        }
    })
    return {
        popperStyle,
        isShowPopper,
        isEmpty
    }
}