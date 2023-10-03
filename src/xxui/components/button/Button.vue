<template>
    <button :class="styleClass">
        <slot></slot>
    </button>
</template>

<script setup lang="ts">

const props = defineProps({
    type: {
        type: String,
        default: 'text',
    },
})

const styleClass = ['xx-button__top', `xx-button_type_${props.type}`]
</script>

<style lang="scss" scoped>
.xx-button__top {
    box-sizing: border-box;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    height: 32px;
    font-size: 14px;
    padding: 14px;
    border-radius: 4px;
    white-space: nowrap;
    outline: none;
    cursor: pointer;
    transition: .1s;
    vertical-align: middle;
}
.xx-button_type_text {
    color: var(--xx-text-color-regular);
    background-color: var(--xx-background-color);
    border: 1px solid var(--xx-border-color);
}
.xx-button_type_primary {
    color: var(--xx-c-white);
    background-color: var(--xx-c-primary);
    border: none;
}
.xx-button_type_danger {
    color: var(--xx-c-white);
    background-color: var(--xx-c-color-danger);
    border: none;
}
</style>