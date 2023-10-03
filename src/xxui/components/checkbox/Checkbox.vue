<script setup lang="ts">
import { UpdateModelValue } from '../../consts/constants';
import {useCheckbox} from './default'

const props = defineProps({
    modelValue: {
        type: Boolean,
    },
    label: String,
})

const emit = defineEmits([UpdateModelValue])

const {isChecked} = useCheckbox(props, emit)

</script>

<template>
    <div class="xx-checkbox__wrapper">
        <input
            type="checkbox"
            v-model="isChecked"
            class="xx-checkbox__input"
        />
        <span class="xx-checkbox__label" @keydown.stop>
            <slot>{{ props.label }}</slot>
        </span>
    </div>
</template>

<style lang="scss" scoped>
.xx-checkbox__wrapper {
  display: inline-flex;
  align-items: center;
  width: auto;
  height: 32px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  .xx-checkbox__input {
    width: 14px;
    height: 14px;
  }
  .xx-checkbox__label {
    padding-left: 8px;
    color: var(--xx-text-color-regular);
  }
}
</style>
