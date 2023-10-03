<script setup>
import {useQyDarkWithClassNames} from '@/hook/use-qy-dark'

const {classNames} = useQyDarkWithClassNames('')
</script>

<template>
    <div :class="classNames">
        <slot></slot>
    </div>
</template>