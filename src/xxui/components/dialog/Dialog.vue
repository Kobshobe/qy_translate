<script setup lang="ts">
import { defineComponent } from 'vue';
import { UpdateModelValue } from '../../consts/constants';
import { useDialog } from './use-dialog';

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

defineComponent({name: 'x-dialog'})
</script>

<template>
    <teleport to="body" :disabled="true">
        <transition>
            <div v-if="props.modelValue" class="xx-dialog__overlay" :style="zIndexStyle" @click="handleSHow">
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
    
    .xx-dialog__header {
        padding-bottom: 30px;
    }

    .xx-dialog__content {
        width: 30%;
        padding: 20px;

        .xx-dialog__footer {
            padding-top: 30px;
        }
    }
}
</style>