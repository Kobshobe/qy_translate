<template>
  <div class="text-scroll-box" ref="foundScrollDOM">
    <div v-if="mode === 'foundText'" class="found-box">
      <div
        class="
          text-style
          found-text-box
          no-color-box
        "
      >
        {{ baseHook.T.find.text }}
      </div>
      <div
        v-if="mode === 'foundText'"
        class="
          text-style
          found-text-box
          absolute-text-box
          no-color-box
        "
        v-html="markHtml"
      ></div>
      <div
        class="
          text-style
          found-text-box
          absolute-text-box 
        "
        v-on:mouseup.stop="findTextMouseup"
      >
        {{ baseHook.T.find.text }}
      </div>
    </div>
    <div
      v-else
      class="
        text-style
        result-text-box
      "
    >
      {{ baseHook.T.find.result?.text }}
    </div>
    <div
      v-if="baseHook.C.showProun && mode === 'foundText' && baseHook.T.find.result?.sPronunciation && baseHook.T.find.text.length < 27"
      class="
        result-text-box
        pronunciation
      "
    >
      [{{ baseHook.T.find.result.sPronunciation }}]
    </div>
    <div
      v-else-if="baseHook.C.showProun && mode === 'resultText' && baseHook.T.find.result?.tPronunciation && baseHook.T.find.text.length < 27"
      class="
        result-text-box
        pronunciation
      "
    >
      [{{ baseHook.T.find.result.tPronunciation }}]
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, inject, watch, ref } from "vue";
import { IBaseHook } from "@/interface/trans";

const props = defineProps({
  mode: String, // foundText, resultText
})

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
</script>

<style scoped lang="scss">

$foundPaddingTop: 0;

.text-scroll-box {
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
  ::v-deep(.mark-text) {
    background: var(--xx-qy-mark-background);
    background-size: 200% 100%;
    background-repeat: no-repeat;
    background-position: 200% 0;
    background-position: 100% 0;
  }
  .text-style {
    font-size: $transTextFontSize;
    color: var(--xx-common-text-color);
    font-family: Arial, Helvetica, sans-serif;
    text-align: left;
  }

  .found-box {
    box-sizing: border-box;
    position: relative;
  }
  .found-text-box {
    box-sizing: border-box;
    padding: 0 $transEdgePadding 0 $transEdgePadding;
    line-height: 25px;
    color: var(--xx-common-text-color);
    background-color: transparent;
  }
  .no-color-box {
    color: rgba(222, 222, 222, 0);
  }
  .absolute-text-box {
    box-sizing: border-box;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  .result-text-box {
    box-sizing: border-box;
    padding: 0 $transEdgePadding 0 $transEdgePadding;
    line-height: 25px;
  }
  .pronunciation {
    color: #aaa;
    font-size: 12px;
  }
}
</style>