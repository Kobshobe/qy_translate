<script setup>
const props = defineProps({
    size: {
        type: String,
        default: '14px',
    },
    color: {
        type: String,
        default: '',
    },
    icon: String
})

const styles = {
    width: props.size,
    height: props.size,
    color: props.color,
}
</script>

<template>
    <div :style="{height: props.size}">
        <svg v-if="props.icon === 'arrow'" :style="styles"  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="currentColor" d="M831.872 340.864 512 652.672 192.128 340.864a30.592 30.592 0 0 0-42.752 0 29.12 29.12 0 0 0 0 41.6L489.664 714.24a32 32 0 0 0 44.672 0l340.288-331.712a29.12 29.12 0 0 0 0-41.728 30.592 30.592 0 0 0-42.752 0z"></path></svg>
    </div>
</template>

<style lang="scss" scoped>
</style>