<script setup lang="ts">
import { defineComponent, ref } from 'vue';
import {useDropdown} from './use-dropdown'

const props = defineProps({
    content: String,
    placement: {
        type: String,
        default: 'auto',
    },
})

document.createElement('div')

const referenceRef = ref()
const dropdownRef = ref()

const {isShowTip, handleShow, handleHide, zIndex} = useDropdown(props, referenceRef, dropdownRef)

defineComponent({
    name: 'x-dropdown'
})
</script>

<template>
    <div class="xx-dropdown_wrapper">
        <div ref="referenceRef" class="xx-dropdown__position" @mouseenter="handleShow" @mouseleave="handleHide">
            <slot></slot>
        </div>
        <teleport to="body">
            <span v-if="isShowTip" ref="dropdownRef" :style="zIndex" class="xx-dropdown__content" @mouseenter="handleShow" @mouseleave="handleHide">
                <slot name="dropdown"></slot>
            </span>
        </teleport>
    </div>
</template>

<style lang="scss" scoped>
.xx-dropdown_wrapper {
    background-color: inherit;
    .dropdown__position {
        background-color: inherit;
    }
}

.xx-dropdown__content {
    position: absolute;
    min-width: 10px;
    visibility: visible;
    background-color: transparent;
}
</style>