<script setup lang="ts">
import { UpdateModelValue } from '@/xxui/consts/constants';
import { EventChange } from '../../consts/constants';
import { defineComponent } from 'vue'

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false,
    }
})

const emit = defineEmits([UpdateModelValue, EventChange])

function handelClick() {
    emit(UpdateModelValue, !props.modelValue)
    emit(EventChange, !props.modelValue)
}

defineComponent({ name: 'XSwich' })
</script>

<template>
    <div class="xx-switch__wrapper" @click="handelClick">
        <span :class=" props.modelValue ? 'xx-switch__core xx-switch-is-checked' : 'xx-switch__core'">
            <div class="xx-switch__action">
                <slot></slot>
            </div>
        </span>
    </div>
</template>

<style lang="scss" scoped>
.xx-switch__wrapper {
    display: inline-flex;
    align-items: center;
    height: 32px;
    cursor: pointer;

    .xx-switch__core {
        box-sizing: border-box;
        position: relative;
        display: inline-flex;
        align-items: center;
        height: 20px;
        min-width: 40px;
        border-radius: 10px;
        background-color: var(--xx-switch-off-color);
        border: 2px solid var(--xx-switch-off-color);
        .xx-switch__action {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 16px;
            height: 16px;
            border-radius: 100%;
            background-color: var(--xx-c-white);
        }
    }
    .xx-switch-is-checked {
        justify-content: end;
        background-color: var(--xx-switch-on-color);
        border: 2px solid var(--xx-switch-on-color);
    }
}
</style>