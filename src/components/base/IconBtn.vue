<template>
    <div class="icon-btn-main" :style="btnStyle">
        <SvgIcon :type=type :size="iconSize" :color="color" />
    </div>
</template>

<script>
import { defineComponent, reactive, computed } from 'vue'
import SvgIcon from './SvgIcon.vue'

export default defineComponent({
    setup(props) {
        const btnStyle = reactive({
            width: props.size + 'px',
            height: props.size + 'px',
            transform: computed(() => {return `rotate(${props.rotate}deg)`})
        })

        return {
            btnStyle
        }
    },
    props: {
        size: {
            type: Number,
            default:25
        },
        type: {
            require: true,
            type: String
        },
        iconSize: {
            default:15
        },
        color: {
            default: "#4C8BF5"
        },
        rotate: {
            default: 0,
            type: Number
        }
    },
    components: {
        SvgIcon
    }
})
</script>

<style scoped>
    .icon-btn-main {
        box-sizing: border-box;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        transition: transform 0.7s;
    }
</style>