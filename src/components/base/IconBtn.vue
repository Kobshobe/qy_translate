<template>
    <div class="icon-btn-main" :style="btnStyle">
        <SvgIcon :type=type :size="iconSize" :color="color" />
    </div>
</template>

<script setup>
import { defineComponent, reactive, computed } from 'vue'
import SvgIcon from './SvgIcon.vue'

const props = defineProps({
    size: {
        type: Number,
        default:25
    },
    type: {
        require: true,
        type: String
    },
    iconSize: {
        type: Number,
        default:15
    },
    color: {
        default: "#4C8BF5"
    },
    rotate: {
        default: 0,
        type: Number
    }
})

const btnStyle = reactive({
    width: props.size + 'px',
    height: props.size + 'px',
    transform: computed(() => {return `rotate(${props.rotate}deg)`})
})
</script>

<style lang="scss" scoped>
    .icon-btn-main {
        box-sizing: border-box;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        transition: transform 0.7s;
        background-color: transparent;
    }
</style>