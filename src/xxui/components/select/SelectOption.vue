<script setup lang="ts">
import {useSelectOption} from './use-select-option'

const props = defineProps({
    label: {
        type: String,
    },
    value: {
        type: [String, Number, Boolean]
    }
})

const {
        handleClick,
        isSelected,
        isSearchingMatch,
    } = useSelectOption(props, null)

</script>

<template>
    <div 
    v-show="isSearchingMatch" 
    :class="isSelected ? 'xx-select__option xx-select-option-selected':'xx-select__option'"
    @click="handleClick">{{ props.label }}</div>
</template>

<style lang="scss" scoped>
.xx-select__option {
    display: block;
    padding-left: 20px;
    height: 32px;
    text-align: start;
    line-height: 32px;
    color: var(--xx-text-color-regular);
    cursor: pointer;
    &:hover {
        background-color: var(--xx-fill-color);
    }
    font-size: 14px;
}

.xx-select-option-selected {
    color: var(--xx-c-primary);
    font-weight: 500;
}
</style>