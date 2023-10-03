<script setup lang="ts">
import {computed, reactive, toRefs, defineComponent} from 'vue'
import { useZIndex } from '@/xxui/hook/useZIndex'
import types from './types'

const {nextZIndex} = useZIndex()

let t:any = null

const state = reactive({
    visable: false,
    top: 0,
})

const props = defineProps({
    type: {
        type: String,
        default: types.INFO,
        validator(val:any) {
            return Object.values(types).includes(val);
        }
    },
    message: {
        type: String,
        default: types.INFO,
    }
})

const setVisible = (isVisible:boolean) => {
    state.visable = isVisible;
    return new Promise((resolve, _) => {
        t = setTimeout(() => {
            resolve('')
            clearTimeout(t)
            t = null
        }, 300)
    })
}

const setTop = (topVal:number) => {
    state.top = topVal;
    return topVal;
}

const styleClass = computed(() => ['xx-message-main', `xx-message-type__${props.type}`])
const {visable, top} = toRefs(state)
const zIndex = nextZIndex()

defineExpose({
    setVisible,
    height: 40,
    margin: 20,
    setTop,
})
defineComponent({name:'x-message'})
</script>

<template>
    <transition name="xx-message-fade">
        <div
        :class="styleClass"
        v-show="visable"
        :style="{
            top: top + 'px',
            'z-index': zIndex,
        }"
        >{{ props.message }}</div>
    </transition>
</template>

<style lang="scss" scoped>
.xx-message-main {
    position: fixed;
    top: 100px;
    left: 50%;
    width: 380px;
    height: 40px;
    margin-left: -190px;
    text-align: center;
    line-height: 40px;
    font-size: 14px;
    border-radius: 5px;
    transition: top .3s ease-out;

    background-color: #f4f4f5;
    color: #73767a;
}
.xx-message-type__info {
    background-color: #f4f4f5;
    color: #73767a;
}
.xx-message-type__success {
    background-color: #f0f9ed;
    color: #529b2e;
}
.xx-message-type__warning {
    background-color: #fdf6ec;
    color: #b88230;
}
.xx-message-type__error {
    background-color: #fef0f0;
    color: #c45656;
}

.xx-message-fade-enter-active {
    transition: all .3s ease-in;
}
.xx-message-fade-leave-active {
    transition: all .3s ease-out;
}

.xx-message-fade-enter-from,
.xx-message-fade-leave-to {
    transform: translateY(-20px);
    opacity: 0;
}
</style>