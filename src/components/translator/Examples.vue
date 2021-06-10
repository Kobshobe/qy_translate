<template>
  <div v-if="example">
    <div class="examples-title-wsrfhedsoufheqiwrhew">例句</div>
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

    return {
      example,
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