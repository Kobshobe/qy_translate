<script setup lang="ts">
import { defineComponent, ref, computed } from 'vue';
import {useTooltip} from './use-tooltip'
import { useQyDarkWithClassNames } from '@/hook/use-qy-dark';

const props = defineProps({
    content: {
        type: String,
        default: '',
    },
    placement: {
        type: String,
        default: 'top-end',
    },
})

const {classNames} = useQyDarkWithClassNames('xx-tooltip__tip')

const referenceRef = ref()
const tipRef = ref()

const {isShowTip, handleShow, handleHide, zIndex} = useTooltip(props, referenceRef, tipRef)

defineComponent({
    name: 'x-tooltip'
})
</script>

<template>
    <div class="xx-tooltip__wrapper">
        <div ref="referenceRef" class="xx-tooltip__position" @mouseenter="handleShow" @mouseleave="handleHide">
            <slot></slot>
        </div>
        <teleport to="body">
            <span v-if="isShowTip" ref="tipRef" :style="zIndex" :class="classNames">{{ props.content }}</span>
        </teleport>
    </div>
</template>

<style lang="scss" scoped>
.xx-tooltip__tip {
    position: absolute;
    background-color: var(--xx-tooltip-background-color);
    border-radius: var(--xx-border-radius-base);
    font-size: 12px;
    min-width: 10px;
    padding: 5px 11px;
    line-height: 20px;
    word-wrap: break-word;
    visibility: visible;
    color: var(--xx-tooltip-color);
}
</style>