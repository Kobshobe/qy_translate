<template>
  <div v-if="transHook.subTranslator.resultData?.examples">
    <div class="examples-title-wsrfhedsoufheqiwrhew">{{transExampleMsg}}</div>
    <div
      v-for="(item, index) in transHook.subTranslator.resultData.examples"
      class="examples-items-wsrfhedsoufheqiwrhew"
      :key="index"
      v-html="item.text"
    ></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject } from "vue";
import {ITranslatorHook} from '@/utils/interface' 

export default defineComponent({
  setup() {
    const transHook = <ITranslatorHook>inject("transHook")
    const transExampleMsg = chrome.i18n.getMessage("transExampple")

    return {
      transHook,transExampleMsg
    };
  },
});
</script>


<style lang="scss" scoped>
@import "@/app.scss";

.examples-title-wsrfhedsoufheqiwrhew {
  font-size: 14px;
  font-weight: bold;
  padding-bottom: 10px;
}
.examples-items-wsrfhedsoufheqiwrhew {
  font-size: 14px;
  padding-bottom: 15px;
  ::v-deep(b) {
     color: $mainColor;
  }
}
</style>