import { isUndefinedOrNull } from '@/xxui/shared/utils';
import { inject, computed } from 'vue';
import { SelectKey } from '../../consts/constants'

export const useSelectOption = (props:any, emit:any) => {
    const selector = inject<any>(SelectKey)!;
    
    selector.optionRegister(props.value, props.label)
    
    const handleClick = () => {
        selector.setSelect(props.value)
    }
    
    const isSelected = computed(() => {
        if (isUndefinedOrNull(selector.selectedValue)) {
            return false
        }
        if (selector.selectedValue === props.value) {
            return true
        }
        return false
    })
    
    const isSearchingMatch = computed(() => {
        if (!selector.searchingText) {
            return true
        }
        return props.label?.includes(selector.searchingText)
    })
    
    return {
        handleClick,
        isSelected,
        isSearchingMatch,
    }
}