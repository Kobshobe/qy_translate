<template>
  <div class="divider-wsrfhedsoufheqiwrhew">
    <div
      v-if="transHook.findStatus === 'reLoading' || transHook.findStatus === 'willOK' "
      class="proccess-wsrfhedsoufheqiwrhew"
      :style="proccessStyle"
    ></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, reactive, onMounted, watchEffect } from "vue";
import { ITranslatorHook } from "@/utils/interface";

export default defineComponent({
  setup() {
    const proccessStyle = reactive({
      width: "50%",
    });

    const transHook = <ITranslatorHook>inject("transHook");

    //   onMounted(() => {
    //     setTimeout(() => {
    //         proccessStyle.width = '100%'
    //     }, 500)
    //   })

    watchEffect(() => {
      if (transHook.findStatus === "reLoading") {
        proccessStyle.width = "70%";
      } else if (transHook.findStatus === "willOK") {
        proccessStyle.width = "100%";
      }else if (transHook.findStatus === "ok") {
        proccessStyle.width = "0%";
      }
    });

    return {
      transHook,
      proccessStyle,
    };
  },
});
</script>

<style lang="scss" scoped>
@import "@/app.scss";

.divider-wsrfhedsoufheqiwrhew {
  position: relative;
  width: 100%;
  height: 4px;
  background-color: #f2f2f2;
  .proccess-wsrfhedsoufheqiwrhew {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    background-color: #cfcfcf;
    transition: 0.4s width;
  }
}
</style>