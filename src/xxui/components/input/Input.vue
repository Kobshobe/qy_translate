<script setup lang="ts">
import { defineComponent } from 'vue';
import {UpdateModelValue} from '../../consts/constants'

const props = defineProps({
    modelValue: String,
    placeholder: String,
    maxlength: Number,
})

const attrs = <any>{}
if (props.maxlength) {
    attrs.maxlength = props.maxlength
}

const emit = defineEmits([UpdateModelValue])

function handleChange(event:any) {
    emit(UpdateModelValue, event.target.value)
}

defineComponent({
    name: 'x-input'
})
</script>

<template>
    <div class="xx-input__wrapper">
        <input class="xx-input__inner"
            :value="props.modelValue"
            @input="handleChange"
            autocomplete="off"
            :placeholder="props.placeholder"
            v-bind="attrs"
        />
    </div>
</template>

<style lang="scss" scoped>
.xx-input__wrapper {
    box-sizing: border-box;
    width: 100%;
    line-height: 32px;
    border-radius: var(--xx-border-radius-base);
    border: 1px solid var(--xx-border-color);
    padding: 1px 11px;
    cursor: text;
    .xx-input__inner {
        width: 100%;
        line-height: 30px;
        padding: 0;
        outline: none;
        border: none;
        background: none;
    }
}
</style>