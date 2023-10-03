import {computed, inject, ref, nextTick} from "vue";
import {RadioGroupKey, UpdateModelValue} from '../../consts/constants'

export const useRadio = (props:any, emit:any) => {
    const radioRef = ref()
    const radioGroup = <any>inject(RadioGroupKey, undefined)
    const isGroup = computed(() => !!radioGroup)

    const modelValue = computed({
        get() {
            return isGroup.value ? radioGroup?.modelValue : props.modelValue
        },
        set(val) {
            if (isGroup.value) {
                radioGroup?.change(val)
            } else {
                emit && emit(UpdateModelValue, val)
            }
            radioRef.value.checked = props.modelValue === props.label
        }
    })

    function handleChange() {
      nextTick(() => {
        if (radioGroup) {
          radioGroup.change(modelValue.value)
        } else {
          emit(UpdateModelValue, props.label)
        }
      })
    }

    return {
        isGroup,
        modelValue,
        radioRef,
        radioGroup,
        handleChange,
    }
}