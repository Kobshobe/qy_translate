<template>
  <div class="sub-result-main" :style="opacityStyle">
    <div class="sub-result-content-box" @click.stop="">
      <div class="sub-result-top">
        <div class="sub-find-text">
          <span
            :class="
              baseHook.T.canReduceMark
                ? 'sub-find-text-mark'
                : ''
            "
            >{{ baseHook.T.subTranslator.selectText }}</span
          >
        </div>
        <div class="sub-top-right">
          <IconBtn
            type="icon-biaoji"
            iconSize=17
            :color="baseHook.T.canReduceMark ? '#4C8BF5':'#ccc'"
            @click="baseHook.T.subTranslator.mark"
          />
          <IconBtn
            type="icon-guanbi1"
            iconSize="15"
            @click="baseHook.T.subTranslator.init"
          />
        </div>
      </div>
      <div class="sub-sound-bar">
        <div class="sub-sound-btn">
          <div
            v-if="showPronunciation"
            class="sub-pronunciation"
          >
            [{{ baseHook.T.subTranslator.resultData?.sPronunciation }}]
          </div>
          <SoundBtn audioType="sub" />
          <div v-if="showPronunciation" style="width: 5px"></div>
        </div>
      </div>

      <DictItems />
      <Examples />
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, computed, reactive, onMounted } from "vue";
import SoundBtn from "./SoundBtn.vue";
import DictItems from "./DictItems.vue";
import Examples from "./Examples.vue";
import IconBtn from "../base/IconBtn.vue";
import { IBaseHook } from "@/interface/trans";

const baseHook = inject("baseHook") as IBaseHook;

const opacityStyle = reactive({
  opacity: 0.2,
});

const showPronunciation = computed(() => {
  return (
    baseHook.T.subTranslator.resultData?.sPronunciation &&
    baseHook.T.subTranslator.resultData.sPronunciation.length < 30
  );
});

onMounted(() => {
  setTimeout(() => {
    opacityStyle.opacity = 1;
  });
});
</script>

<style scoped lang="scss">

.sub-result-main {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.3);
  transition: opacity 0.8s;
  width: 100%;
  max-height: 100%;
  background-color: rgba(120, 120, 120, 0.1);
  border-radius: 5px;
  .sub-result-content-box {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    background-color: var(--xx-background-color);
    border: 1px solid var(--xx-border-only-dark);
    padding: 25px $transEdgePadding 20px $transEdgePadding;
    font-size: $transTextFontSize;
    overflow: scroll;
    overflow-x: hidden;
    overflow-y: visible;
    border-radius: 5px;
    // border-bottom-left-radius: $transRadius;
    // border-bottom-right-radius: $transRadius;
    .sub-result-top {
      display: flex;
      justify-content: space-between;
      .sub-find-text {
        font-size: 18px;
        font-weight: bold;
        padding-bottom: 16px;
      }
      .sub-find-text-mark {
        background: var(--xx-qy-mark-background);
        background-size: 200% 100%;
        background-repeat: no-repeat;
        background-position: 200% 0;
        background-position: 100% 0;
      }
      .sub-top-right {
        display: flex;
        flex-wrap: nowrap;
        flex-shrink: 0;
      }
    }
    .sub-sound-bar {
      display: flex;
      .sub-sound-btn {
        display: flex;
        height: 26px;
        min-width: 27px;
        width: auto;
        align-items: center;
        // border-radius: 13px;
        // background-color: #eee;
        margin-bottom: 16px;
        .sub-pronunciation {
          color: #ddd;
          font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
          // padding-left: 12px;
          color: #aaa;
          font-size: 13px;
        }
      }
    }
  }
}
</style>
