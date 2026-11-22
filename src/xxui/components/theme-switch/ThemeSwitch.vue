<script setup lang="ts">
import { computed } from 'vue'
import { geti18nMsg } from '@/utils/share'
import SvgIcon from '@/components/base/SvgIcon.vue'

type ThemeMode = 'light' | 'dark' | 'auto'

const props = defineProps({
    modelValue: {
        type: String as () => ThemeMode,
        default: 'auto',
    },
    // effective browser/system preference, used for the auto tooltip only
    systemDark: {
        type: Boolean,
        default: false,
    },
})

const emit = defineEmits(['update:modelValue'])

// clicking cycles through the three modes in this order
const cycle: ThemeMode[] = ['light', 'dark', 'auto']

const isAuto = computed(() => props.modelValue === 'auto')
const nextMode = computed<ThemeMode>(
    () => cycle[(cycle.indexOf(props.modelValue) + 1) % cycle.length]
)

const modeName = (mode: ThemeMode) => geti18nMsg(`theme_${mode}`)

const ariaLabel = computed(
    () => `${geti18nMsg('theme')}: ${modeName(props.modelValue)} -> ${modeName(nextMode.value)}`
)
const autoTip = computed(() =>
    geti18nMsg(props.systemDark ? 'theme_auto_tip_dark' : 'theme_auto_tip_light')
)

function setMode(mode: ThemeMode) {
    if (mode === props.modelValue) {
        return
    }
    emit('update:modelValue', mode)
}

function handleClick() {
    setMode(nextMode.value)
}

function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        handleClick()
    } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        setMode('light')
    } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        setMode('dark')
    }
}
</script>

<template>
    <div class="xx-theme-switch" role="button" tabindex="0" :aria-label="ariaLabel"
        @click="handleClick" @keydown="handleKeydown">
        <!-- face 1: the familiar light/dark switch -->
        <div class="xx-theme-switch__face" :class="{ 'is-hidden': isAuto }">
            <span class="xx-theme-switch__track" :class="{ 'is-checked': modelValue === 'dark' }">
                <span class="xx-theme-switch__knob">
                    <SvgIcon v-if="modelValue === 'dark'" type="dark-moon" :size="10" />
                    <SvgIcon v-else type="light-sun" :size="12" />
                </span>
            </span>
        </div>

        <!-- face 2: auto chip, replaces the switch in the same slot -->
        <div class="xx-theme-switch__face" :class="{ 'is-hidden': !isAuto }">
            <span class="xx-theme-switch__auto" :title="autoTip">
                <SvgIcon type="theme-auto" :size="11" />
                <span>{{ geti18nMsg('theme_auto') }}</span>
            </span>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.xx-theme-switch {
    position: relative;
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 54px;
    height: 32px;
    border-radius: var(--xx-border-radius-base);
    cursor: pointer;
    user-select: none;

    &:focus-visible {
        outline: 2px solid var(--xx-c-primary);
        outline-offset: 2px;
    }

    &__face {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: opacity 0.14s ease, transform 0.14s ease;

        &.is-hidden {
            opacity: 0;
            transform: scale(0.94);
            pointer-events: none;
        }
    }

    &__track {
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        height: 20px;
        min-width: 40px;
        border-radius: 10px;
        background-color: var(--xx-switch-off-color);
        border: 2px solid var(--xx-switch-off-color);
        transition: background-color 0.18s, border-color 0.18s;

        &.is-checked {
            justify-content: flex-end;
            background-color: var(--xx-switch-on-color);
            border-color: var(--xx-switch-on-color);
        }
    }

    &__knob {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background-color: var(--xx-c-white);
    }

    &__auto {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        height: 22px;
        padding: 0 8px 0 6px;
        border-radius: 11px;
        border: 1px solid var(--xx-c-primary);
        background-color: var(--xx-fill-color);
        color: var(--xx-c-primary);
        font-size: 11px;
        font-weight: 600;
    }
}
</style>
