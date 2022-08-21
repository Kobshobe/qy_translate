<template>
  <div class="text-scroll-box-wsrfhedsoufheqiwrhew" ref="foundScrollDOM">
    <div v-if="mode === 'foundText'" class="found-box-wsrfhedsoufheqiwrhew">
      <div
        v-if="mode === 'foundText'"
        class="
          text-style-wsrfhedsoufheqiwrhew
          mark-text-box-wsrfhedsoufheqiwrhew
          no-color-box-wsrfhedsoufheqiwrhew
        "
        v-html="markHtml"
      ></div>
      <div
        class="
          text-style-wsrfhedsoufheqiwrhew
          found-text-box-wsrfhedsoufheqiwrhew
        "
        v-on:mouseup.stop="findTextMouseup"
      >
        {{ baseHook.T.find.text }}
      </div>
    </div>
    <div
      v-else
      class="
        text-style-wsrfhedsoufheqiwrhew
        result-text-box-wsrfhedsoufheqiwrhew
      "
    >
      {{ baseHook.T.find.result?.text }}
    </div>
    <div
      v-if="baseHook.C.showProun && mode === 'foundText' && baseHook.T.find.result?.sPronunciation && baseHook.T.find.text.length < 27"
      class="
        result-text-box-wsrfhedsoufheqiwrhew
        pronunciation-wsrfhedsoufheqiwrhew
      "
    >
      [{{ baseHook.T.find.result.sPronunciation }}]
    </div>
    <div
      v-else-if="baseHook.C.showProun && mode === 'resultText' && baseHook.T.find.result?.tPronunciation && baseHook.T.find.text.length < 27"
      class="
        result-text-box-wsrfhedsoufheqiwrhew
        pronunciation-wsrfhedsoufheqiwrhew
      "
    >
      [{{ baseHook.T.find.result.tPronunciation }}]
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, watch, ref } from "vue";
import { IBaseHook } from "@/interface/trans";

export default defineComponent({
  props: {
    mode: String, // foundText, resultText
  },
  setup(props) {
    const baseHook = inject("baseHook") as IBaseHook;
    const markHtml = ref("");
    const foundScrollDOM = ref<any | null>(null);

    markHtml.value = baseHook.T.getMarkHtml();

    const findTextMouseup = (e: any) => {
      const sel: any = window.getSelection();
      if (sel.toString().replace(/[\s|\n]/g, "") !== "") {
        baseHook.T.subTranslator.top =
          e.offsetY - foundScrollDOM.value.scrollTop + 15;
        baseHook.T.subTranslator.left = e.offsetX;
        baseHook.T.subTranslator.selectText = sel.toString();
        baseHook.T.subTranslator.selectRange = [
          sel.getRangeAt(0).startOffset,
          sel.getRangeAt(0).endOffset,
        ];
        baseHook.T.subTranslator.bookMark();
        baseHook.T.subTranslator.status = "showGate";
      }
    };

    watch(
      () => baseHook.T.marksList,
      () => {
        markHtml.value = baseHook.T.getMarkHtml();
      }
    );

    return { baseHook, markHtml, findTextMouseup, foundScrollDOM };
  },
});
</script>

<style scoped lang="scss">
@import "@/app.scss";

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
    background: #b4d7ff;
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

  .found-box-wsrfhedsoufheqiwrhew {
    box-sizing: border-box;
    position: relative;
  }
  .found-text-box-wsrfhedsoufheqiwrhew {
    box-sizing: border-box;
    padding: 0 $transEdgePadding 0 $transEdgePadding;
    line-height: 25px;
    color: black;
  }
  .no-color-box-wsrfhedsoufheqiwrhew {
    color: rgba(222, 222, 222, 0);
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
  }
  .result-text-box-wsrfhedsoufheqiwrhew {
    box-sizing: border-box;
    padding: 0 $transEdgePadding 0 $transEdgePadding;
    line-height: 25px;
  }
  .pronunciation-wsrfhedsoufheqiwrhew {
    color: #aaa;
    font-size: 12px;
  }
}
</style>