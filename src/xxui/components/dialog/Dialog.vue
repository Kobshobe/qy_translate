<script setup lang="ts">
import { defineComponent } from 'vue';
import { UpdateModelValue } from '../../consts/constants';
import { useDialog } from './use-dialog';
import { useQyDarkWithClassNames } from '@/hook/use-qy-dark';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false,
    },
    title: {
        type: String,
        default: ''
    },
    width: {
        type: String,
    }
})

const emit = defineEmits([UpdateModelValue])

const {zIndexStyle, contentStyle, handleSHow} = useDialog(props, emit)
const {classNames} = useQyDarkWithClassNames('xx-dialog__overlay')

defineComponent({name: 'x-dialog'})
</script>

<template>
    <teleport to="body" :disabled="true">
        <transition>
            <div v-if="props.modelValue" :class="classNames" :style="zIndexStyle" @click="handleSHow">
                <div class="xx-dialog__content" :style="contentStyle" @click.stop="">
                    <header v-if="props.title" class="xx-dialog__header">
                        {{ props.title }}
                    </header>
                    <div>
                        <slot></slot>
                    </div>
                    <footer v-if="$slots.footer" class="xx-dialog__footer">
                        <slot name="footer"></slot>
                    </footer>
                </div>
            </div>
        </transition>
    </teleport>
</template>

<style lang="scss" scoped>
.xx-dialog__overlay {
    position: fixed;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--xx-overlay-color-lighter);

    .xx-dialog__content {
        scrollbar-width: thin;
        scrollbar-color: var(--xx-border-color) transparent;

        &::-webkit-scrollbar {
            width: 4px;
        }
        &::-webkit-scrollbar-track {
            background: transparent;
        }
        &::-webkit-scrollbar-thumb {
            background: var(--xx-border-color);
            border-radius: 2px;
        }
        background-color: var(--xx-background-color);
        width: 30%;
        max-height: 80vh;
        padding: 20px;
        border: 1px solid var(--xx-border-only-dark);
        border-radius: 5px;
        overflow-y: auto;
        .xx-dialog__header {
            padding-bottom: 30px;
            color: var(--xx-text-color-regular);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .xx-dialog__footer {
            padding-top: 30px;
        }
    }
}
</style>