import {computed} from 'vue'
import { UpdateModelValue } from '../../consts/constants'

export function useCheckbox(props:any, emit:any) {

    const isChecked = computed<boolean>({
        get() {
            if (typeof props.modelValue === 'boolean') {
                return props.modelValue
            }
            return false
        },
        set(v) {
            emit(UpdateModelValue, v)
        }
    })

    return {
        isChecked
    }
}