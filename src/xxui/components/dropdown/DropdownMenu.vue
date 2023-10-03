<script setup lang="ts">

</script>

<template>
    <div class="xx-dropdown_menu__wrapper">
        <div class="xx-dropdown_menu__scroll">
            <slot></slot>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.xx-dropdown_menu__wrapper {
    padding: 6px 0;
    margin: 10px;
    border-radius: var(--xx-border-radius-base);
    border: 1px solid var(--xx-border-color);
    .xx-dropdown_menu__scroll {
        background-color: var(--xx-background-color);
        overflow: auto;
    }
}
</style>