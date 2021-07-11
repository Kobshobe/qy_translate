<template>
  <div
    v-if="transHook.toast.show"
    class="toast-main-wsrfhedsoufheqiwrhew"
    @click="transHook.toast.show = false"
  >
    <div class="toast-content-box-wsrfhedsoufheqiwrhew">{{ transHook.toast.msg }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject } from "vue";

export default defineComponent({
  setup() {
    const transHook = inject<any>("transHook");

    return {
      transHook,
    };
  },
});
</script>

<style scoped lang="scss">
@import "@/app.scss";

.toast-main-wsrfhedsoufheqiwrhew {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  .toast-content-box-wsrfhedsoufheqiwrhew {
    padding: 10px;
    border-radius: 3px;
    border: $toastBorder;
    background-color: $toastBGC;
    box-shadow: $normalBoxShadow;
    font-size: 13px;
    color: $toastColor;
  }
}
</style>