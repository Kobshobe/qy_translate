<script setup lang="ts">
import {provide, reactive, toRefs} from "vue";
import {RadioGroupKey, UpdateModelValue} from '../../consts/constants'

const props = defineProps({
  modelValue: String
})

const emits = defineEmits([UpdateModelValue])

function change(s:any) {
  emits(UpdateModelValue, s)
}

provide(RadioGroupKey, reactive({
  ...toRefs(props),
  change,
}))

</script>

<template>
  <div>
    <slot></slot>
  </div>
</template>