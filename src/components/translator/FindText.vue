<template>
  <div class="text-scroll-box-wsrfhedsoufheqiwrhew" ref="foundScrollDOM">
    <div v-if="mode === 'foundText'" class="found-box-wsrfhedsoufheqiwrhew">
      <div
        class="text-style-wsrfhedsoufheqiwrhew found-text-box-wsrfhedsoufheqiwrhew"
        v-on:mouseup.stop="findTextMouseup"
      >
        {{ translator.find.text }}
      </div>

      <div
        v-if="mode === 'foundText'"
        class="text-style-wsrfhedsoufheqiwrhew mark-text-box-wsrfhedsoufheqiwrhew"
        v-html="markHtml"
      ></div>
    </div>
    <div v-else class="text-style-wsrfhedsoufheqiwrhew result-text-box-wsrfhedsoufheqiwrhew">
      {{ translator.find.result?.text }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, watch, ref } from "vue";

export default defineComponent({
  props: {
    mode: String,
  },
  setup(props) {
    const translator = inject<any>("translator");
    const markHtml = ref("");
    const foundScrollDOM = ref<any | null>(null);
    markHtml.value = translator.getMarkHtml();

    const findTextMouseup = (e: any) => {
      const sel: any = window.getSelection();
      if (sel.toString().replace(/[\s|\n]/g, "") !== "") {
        translator.subTranslator.top =
          e.offsetY - foundScrollDOM.value.scrollTop + 30;
        translator.subTranslator.left = e.offsetX;
        translator.subTranslator.selectText = sel.toString();
        translator.subTranslator.selectRange = [
          sel.getRangeAt(0).startOffset,
          sel.getRangeAt(0).endOffset,
        ];
        translator.subTranslator.bookMark();
        translator.subTranslator.status = "showGate";
      }
    };

    watch(
      () => translator.marksList,
      () => {
        markHtml.value = translator.getMarkHtml();
      }
    );

    return { translator, markHtml, findTextMouseup, foundScrollDOM };
  },
});
</script>

<style scoped lang="scss">
@import "../../app.scss";

$foundPaddingTop: 0;

.text-scroll-box-wsrfhedsoufheqiwrhew {
  box-sizing: border-box;
  width: 100%;
  min-height: 100px;
  max-height: 200px;
  overflow: scroll;
  overflow-x: hidden;
  overflow-y: visible;
  ::selection {
    background: lightblue;
    color: black;
  }
  ::v-deep(.mark-text-wsrfhedsoufheqiwrhew) {
    background: linear-gradient(transparent 65%, #81d3f8 50%);
    background-size: 200% 100%;
    background-repeat: no-repeat;
    background-position: 200% 0;
    background-position: 100% 0;
  }
  .text-style-wsrfhedsoufheqiwrhew {
    font-size: $transTextFontSize;
    color: black;
    font-family: Arial, Helvetica, sans-serif;
    text-align: left;
  }
  .mark-text-box-wsrfhedsoufheqiwrhew {
    box-sizing: border-box;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -100;
    padding: 0 $transEdgePadding 0 $transEdgePadding;
    line-height: 25px;
    color: black;

  }
  .found-box-wsrfhedsoufheqiwrhew {
    box-sizing: border-box;
    position: relative;
  }
  .found-text-box-wsrfhedsoufheqiwrhew {
    box-sizing: border-box;
    padding: 0 $transEdgePadding 0 $transEdgePadding;
    color: rgba(222, 222, 222, 0);
    line-height: 25px;
  }
  .result-text-box-wsrfhedsoufheqiwrhew {
    box-sizing: border-box;
    padding: 0 $transEdgePadding 0 $transEdgePadding;
    line-height: 25px;
  }
}
</style>