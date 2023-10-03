<template>
  <div class="divider">
    <div
      v-if="baseHook.findStatus === 'reLoading' || baseHook.findStatus === 'willOK' "
      class="proccess"
      :style="proccessStyle"
    ></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, reactive, onMounted, watchEffect } from "vue";
import { IBaseHook } from "@/interface/trans";

export default defineComponent({
  setup() {
    const proccessStyle = reactive({
      width: "50%",
    });

    const baseHook = inject("baseHook") as IBaseHook;

    watchEffect(() => {
      if (baseHook.findStatus === "reLoading") {
        proccessStyle.width = "70%";
      } else if (baseHook.findStatus === "willOK") {
        proccessStyle.width = "100%";
      }else if (baseHook.findStatus === "ok") {
        proccessStyle.width = "0%";
      }
    });

    return {
      baseHook,
      proccessStyle,
    };
  },
});
</script>

<style lang="scss" scoped>

.divider {
  position: relative;
  width: 100%;
  height: 4px;
  background-color: var(--xx-fill-color-deep);
  .proccess {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    background-color: #cfcfcf;
    transition: 0.4s width;
  }
}
</style>