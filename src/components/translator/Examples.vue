<template>
  <div v-if="example">
    <div class="examples-title-wsrfhedsoufheqiwrhew">{{transExampleMsg}}</div>
    <div
      v-for="(item, index) in example"
      class="examples-items-wsrfhedsoufheqiwrhew"
      :key="index"
      v-html="item.text"
    ></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject } from "vue";

export default defineComponent({
  setup() {
    const example = inject<any>("translator").subTranslator.resultData.data
      .examples?.example;

    const transExampleMsg = chrome.i18n.getMessage("transExampple")

    return {
      example,transExampleMsg
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