<script setup lang="ts">
import { defineComponent, h, reactive, toRefs } from 'vue';
import { useZIndex } from '../../hook/useZIndex';
import XButton from '../button/Button.vue'

const {nextZIndex} = useZIndex()

const zIndex = `z-index:${nextZIndex()}`

const state = reactive({
    visible: false,
    type: 'confirm'
})

const props = defineProps({
    title: String,
    msg: String,
    confirmButtonText: String,
    cancelButtonText: String,
    field: {
        type: String,
        default: 'alert',
    },
    callback: Function
})

const {visible} = toRefs(state)

const setVisible = (isVisible:boolean) => {
    state.visible = isVisible
}

function handleCancel() {
    state.type = 'cancel'
    setVisible(false)
    props.callback && props.callback('cancel');
}

function handleConfirm() {
    setVisible(false);
    state.type = 'confirm'
    props.callback && props.callback('confirm');
}

const ContentView = ({field}:any) :any => {
    switch (field) {
        case !field || 'alert':
            return h('p', null, props.msg);
        default:
            return '';
    }
}

defineExpose({
    setVisible,
    state,
});

defineComponent({
    name: 'x-message-box' 
});
</script>

<template>
    <transition name="xx-messagebox-fade">
        <div v-show="visible" class="xx-messagebox__overlay" :style="zIndex" @click="setVisible(false)">
            <div class="xx-messagebox__wrapper" @click.stop>
                <div v-if="props.title" class="xx-messagebox__title">{{ title }}</div>
                <div class="xx-messagebox__content">
                    <ContentView :field="props.field" />
                </div>
                <div class="xx-messagebox__footer">
                    <x-button v-if="props.cancelButtonText" @click="handleCancel">{{ props.cancelButtonText }}</x-button>
                    <div style="width: 15px;"></div>
                    <x-button v-if="props.confirmButtonText" type="primary" @click="handleConfirm">{{ props.confirmButtonText }}</x-button>
                </div>
            </div>
        </div>
    </transition>
</template>

<style lang="scss" scoped>
.xx-messagebox__overlay {
    position: fixed;
    inset: 0;
    background-color: var(--xx-overlay-color-lighter);
    .xx-messagebox__wrapper {
        position: absolute;
        top: 40%;
        left: 50%;
        width: 420px;
        margin: 0 0 0 -210px;
        padding: 30px 20px 20px 20px;
        border-radius: var(--xx-border-radius-base);
        background-color: var(--xx-background-color);
        .xx-messagebox__title {
            padding-bottom: 30px;
            font-size: 16px;
        }
        .xx-messagebox__content {
            padding-bottom: 30px;
            font-size: 14px;
        }
        .xx-messagebox__footer {
            display: flex;
            justify-content: end;
        }
    }
}

.xx-messagebox-fade-enter-from,
.xx-messagebox-fade-leave-to {
    opacity: 0;
}

.xx-messagebox-fade-enter-active {
    transition: opacity .2s ease-in;
}

.xx-messagebox-fade-leave-active {
    transition: opacity .2s ease-out;
}
</style>