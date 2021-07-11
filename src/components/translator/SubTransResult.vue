<template>
  <div class="sub-result-main-wsrfhedsoufheqiwrhew" :style="opacityStyle">
    <div class="sub-result-content-box-wsrfhedsoufheqiwrhew" @click.stop="">
      <div class="sub-result-top-wsrfhedsoufheqiwrhew">
        <div class="sub-find-text-wsrfhedsoufheqiwrhew">
          <span
            :class="
              transHook.canReduceMark
                ? 'sub-find-text-mark-wsrfhedsoufheqiwrhew'
                : ''
            "
            >{{ transHook.subTranslator.selectText }}</span
          >
        </div>
        <div class="sub-top-right-wsrfhedsoufheqiwrhew">
          <IconBtn
            type="icon-biaoji"
            iconSize=17
            :color="transHook.canReduceMark ? '#4C8BF5':'#ccc'"
            @click="transHook.subTranslator.mark"
          />
          <IconBtn
            type="icon-guanbi"
            iconSize="13"
            @click="transHook.subTranslator.init"
          />
        </div>
      </div>
      <div class="sub-sound-bar-wsrfhedsoufheqiwrhew">
        <div class="sub-sound-btn-wsrfhedsoufheqiwrhew">
          <div
            v-if="showPronunciation"
            class="sub-pronunciation-wsrfhedsoufheqiwrhew"
          >
            {{ transHook.subTranslator.resultData?.sPronunciation }}
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

<script lang="ts">
import { defineComponent, inject, computed, reactive, onMounted } from "vue";
import SoundBtn from "./SoundBtn.vue";
import DictItems from "./DictItems.vue";
import Examples from "./Examples.vue";
import IconBtn from "../base/IconBtn.vue";
import { ITranslatorHook } from "@/utils/interface";

export default defineComponent({
  setup() {
    const transHook = <ITranslatorHook>inject("transHook");

    const opacityStyle = reactive({
      opacity: 0.2,
    });

    const showPronunciation = computed(() => {
      return (
        transHook.subTranslator.resultData?.sPronunciation &&
        transHook.subTranslator.resultData.sPronunciation.length < 30
      );
    });

    onMounted(() => {
      setTimeout(() => {
        opacityStyle.opacity = 1;
      });
    });

    return {
      transHook,
      showPronunciation,
      opacityStyle,
    };
  },
  components: {
    DictItems,
    Examples,
    IconBtn,
    SoundBtn,
  },
});
</script>

<style scoped lang="scss">
@import "@/app.scss";

.sub-result-main-wsrfhedsoufheqiwrhew {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.3);
  transition: opacity 0.8s;
  width: 100%;
  max-height: 100%;
  background-color: rgba(120, 120, 120, 0.1);
  border-radius: 5px;
  overflow: hidden;
  .sub-result-content-box-wsrfhedsoufheqiwrhew {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    background-color: white;
    padding: 25px $transEdgePadding 20px $transEdgePadding;
    font-size: $transTextFontSize;
    overflow: scroll;
    overflow-x: hidden;
    overflow-y: visible;
    border-bottom-left-radius: $transRadius;
    border-bottom-right-radius: $transRadius;
    .sub-result-top-wsrfhedsoufheqiwrhew {
      display: flex;
      justify-content: space-between;
      .sub-find-text-wsrfhedsoufheqiwrhew {
        font-size: 18px;
        font-weight: bold;
        padding-bottom: 16px;
      }
      .sub-find-text-mark-wsrfhedsoufheqiwrhew {
        background: linear-gradient(transparent 65%, #81d3f8 50%);
        background-size: 200% 100%;
        background-repeat: no-repeat;
        background-position: 200% 0;
        background-position: 100% 0;
      }
      .sub-top-right-wsrfhedsoufheqiwrhew {
        display: flex;
        flex-wrap: nowrap;
        flex-shrink: 0;
      }
    }
    .sub-sound-bar-wsrfhedsoufheqiwrhew {
      display: flex;
      .sub-sound-btn-wsrfhedsoufheqiwrhew {
        display: flex;
        height: 26px;
        min-width: 27px;
        width: auto;
        align-items: center;
        border-radius: 13px;
        background-color: #eee;
        margin-bottom: 16px;
        .sub-pronunciation-wsrfhedsoufheqiwrhew {
          color: #ddd;
          font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
          padding-left: 12px;
          color: #555;
        }
      }
    }
  }
}
</style>
