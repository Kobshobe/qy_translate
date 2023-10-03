<script setup lang="ts">
import { propsDefine, useSelectGroup } from './use-select-group';

const props = defineProps(propsDefine)

useSelectGroup(props)
</script>

<template>
    <div class="xx-select-group__wrapper">
        <div class="xx-select-group__title">{{ props.label }}</div>
        <slot></slot>
    </div>
</template>

<style lang="scss" scoped>
.xx-select-group__wrapper {
    position: relative;
    .xx-select-group__title {
        font-size: 12px;
        line-height: 30px;
        color: var(--xx-color-info);
        padding-left: 20px;
    }
    &:not(:last-of-type) {
        padding-bottom: 24px;
        &::after {
            content: "";
            position: absolute;
            display: block;
            left: 20px;
            right: 20px;
            bottom: 12px;
            height: 1px;
            background: var(--xx-border-color);
        }
    }
}
</style>