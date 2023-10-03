<script setup lang="ts">

</script>

<template>
    <div class="xx-dropdown_item_wrapper">
        <slot></slot>
    </div>
</template>

<style lang="scss" scoped>
.xx-dropdown_item_wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px 20px;
    font-size: 14px;
    color: var(--xx-text-color-regular);
    cursor: pointer;
    &:hover {
        color: var(--xx-c-primary);
        background-color: var(--xx-fill-color);
    }
}
</style>