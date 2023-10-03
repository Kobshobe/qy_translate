import { SelectGroupKey, SelectKey } from "@/xxui/consts/constants"
import { reactive, provide, inject } from "vue"

export const propsDefine = {
    label: String
}

export const useSelectGroup = (props:any) => {
    const provideObj = reactive({
        groupLabel: props.label,
    })

    provide(SelectGroupKey, provideObj)
}