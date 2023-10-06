<template>
  <div
    v-if="baseHook.toast.show"
    class="toast-main"
    @click="baseHook.toast.show = false"
  >
    <div class="toast-content-box">{{ baseHook.toast.msg }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject } from "vue";
import {IBaseHook} from '@/interface/trans';

export default defineComponent({
  setup() {
    const baseHook = inject("baseHook") as IBaseHook;

    return {
      baseHook,
    };
  },
});
</script>

<style scoped lang="scss">

.toast-main {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  .toast-content-box {
    display: flex;
    justify-content: center;
    align-content: center;
    padding: 10px;
    border-radius: 3px;
    border: $toastBorder;
    background-color: $toastBGC;
    box-shadow: $normalBoxShadow;
    font-size: 13px;
    color: $toastColor;
    text-align: center;
  }
}
</style>