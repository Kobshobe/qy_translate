<script setup lang="ts">

const props = defineProps({
    width: {
        type: String,
        default: 'none',
    },
    height: {
        type: String,
        default: 'none',
    }
})

const styleProps:any = {
    ...props
}

if (props.height === 'none') {
    styleProps.display = 'inline-block'
}
</script>

<template>
    <div :style="styleProps"></div>
</template>