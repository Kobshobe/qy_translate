<template>
  <div v-if="baseHook.T.subTranslator.resultData?.examples">
    <div class="examples-title">{{ transExampleMsg }}</div>
    <div
      v-for="(item, index) in baseHook.T.subTranslator.resultData.examples"
      :key="index"
      class="examples-item"
    >
      <div class="examples-text" v-html="item.text"></div>
      <div
        class="examples-trans"
        v-html="item.trans"
      ></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject } from "vue";
import { IBaseHook } from "@/interface/trans";

export default defineComponent({
  setup() {
    const baseHook = inject("baseHook") as IBaseHook;
    const transExampleMsg = chrome.i18n.getMessage("transExampple");

    return {
      baseHook,
      transExampleMsg,
    };
  },
});
</script>


<style lang="scss" scoped>
// @import "@/app.scss";

.examples-title {
  font-size: 14px;
  font-weight: bold;
  padding-bottom: 10px;
}

.examples-item {
  padding-bottom: 16px;
  .examples-text {
    font-size: 14px;
    padding-bottom: 8px;
    ::v-deep(b) {
      color: $mainColor;
    }
  }

  .examples-trans {
    font-size: 14px;
    color: #555;
    ::v-deep(b) {
      color: $mainColor;
    }
  }
}
</style>