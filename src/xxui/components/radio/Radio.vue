<script setup lang="ts">
import {useRadio} from './hooks'
import {UpdateModelValue} from '../../consts/constants'

const props = defineProps({
    modelValue: {
        type: [String, Boolean],
        default: '',
    },
    label: {
        type: String,
        default: '',
    }
})

const emit = defineEmits([UpdateModelValue])

const {modelValue, radioRef, handleChange} = useRadio(props, emit)

</script>

<template>
    <label class="xx-radio__wrapper">
        <input 
          v-model="modelValue" 
          :value="props.label" 
          @change="handleChange" 
          ref="radioRef" 
          type="radio"
          class="xx-radio__input"
        />
        <span class="xx-radio__label" @keydown.stop>
            <slot>{{props.label}}</slot>
        </span>
    </label>
</template>

<style lang="scss" scoped>
.xx-radio__wrapper {
  display: inline-flex;
  align-items: center;
  width: auto;
  height: 32px;
  cursor: pointer;
  font-weight: 500;
  .xx-radio__input[type="radio"] {
    width: 15px;
    height: 15px;
  }
  .xx-radio__label {
    padding-left: 8px;
    color: var(--xx-text-color-regular);
    font-size: 14px;
  }
}
</style>