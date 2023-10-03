<script setup lang="ts">
import { ref } from 'vue';
import {useSelectPopper} from './use-select-popper'
import { useQyDarkWithClassNames } from '@/hook/use-qy-dark';

const props = defineProps({
    style: Object,
})

const popperContent = ref<HTMLElement>()

const {popperStyle, isShowPopper, isEmpty} = useSelectPopper(popperContent, props)
const {classNames} = useQyDarkWithClassNames('xx-select__popper')
</script>

<template>
    <div v-show="isShowPopper" :style="popperStyle" :class="classNames" @click.stop>
        <div ref="popperContent" class="xx-select-popper-scroll" @click.stop>
            <div v-show="!isEmpty">
                <slot></slot>
            </div>
            <div v-show="isEmpty" class="xx-select-popper-empty">not content</div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.xx-select__popper {
    position: relative;
    display: block;
    border-radius: 4px;
    border: 1px solid var(--xx-border-color);
    background-color: var(--xx-background-color);
    overflow-y: auto;
    box-shadow: var(--xx-box-shawdow);

    &::-webkit-scrollbar-track {
        background-color: transparent;
    }
    &::-webkit-scrollbar {
        width: 5px;
    }
    &::-webkit-scrollbar-thumb {
        border-radius: 10px;
        background: rgba(0, 0, 0, 0);
        -webkit-box-shadow: inset006pxrgba(0, 0, 0, 0.5);
        opacity: 0;
        transition: opacity 0.3s ease-in-out;
    }
    &:hover {
        &::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.1);
        }
    }

    .xx-select-popper-scroll {
        padding: 6px 0;
    }
    .xx-select-popper-empty {
        display: block;
        padding-left: 20px;
        height: 32px;
        line-height: 32px;
        color: var(--xx-text-color-regular);
        font-size: 14px;
    }
}
</style>