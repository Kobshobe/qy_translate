<script setup lang="ts">
import { ref, defineComponent } from 'vue'
import { selectProps, useSelect } from './use-select'
import { EventChange, UpdateModelValue } from '../../consts/constants'
import XSelectPopper from './SelectPopper.vue'
import XSvgIcon from '../svg-icon/SvgIcon.vue'

const props = defineProps(selectProps)
const emit = defineEmits([UpdateModelValue, EventChange])

const selectorRef = ref()

const { displayLabel, isShowPopper, setShowPopper, placeholder } = useSelect(props, emit, selectorRef)
defineComponent({name: 'x-select'})
</script>

<template>
    <div ref="selectorRef" class="xx-select__wrapper">
        <label class="xx-select-input__wrapper">
            <input
                v-model="displayLabel" 
                @click="setShowPopper(!isShowPopper)" 
                :placeholder="placeholder" 
                class="xx-select__input"
                :readonly="!isShowPopper"
            />
            <div :class="isShowPopper ? 'xx-select-input__suffix xx-select-input-rotate__suffix' : 'xx-select-input__suffix'">
                <XSvgIcon icon="arrow" size="14px" color="var(--xx-text-color-regular)" />
            </div>
        </label>
        <teleport to='body'>
            <XSelectPopper>
                <slot></slot>
            </XSelectPopper>
        </teleport>
        
    </div>
</template>

<style lang="scss" scoped>
.xx-select__wrapper {
    box-sizing: border-box;
    position: relative;
    display: inline-block;
    height: 32px;
    border-radius: 4px;
    border: 1px solid var(--xx-border-color);
    background-color: var(--xx-background-color);
    padding: 1px 11px;
    z-index: auto;
    .xx-select-input__wrapper {
        display: inline-flex;
        align-items: center;
        height: 100%;
        cursor: pointer;
        .xx-select__input {
            box-sizing: border-box;
            height: 100%;
            width: 100%;
            border: none;
            box-shadow: none;
            outline: none;
            color: var(--xx-text-color-regular);
            cursor: pointer;
            font-size: 14px;
            background-color: var(--xx-background-color);
        }
        .xx-select-input__suffix {
            display: flex;
            transition: transform .3s ease-in-out;
        }
        .xx-select-input-rotate__suffix {
            transform: rotate(-180deg);
        }
    }

}
</style>