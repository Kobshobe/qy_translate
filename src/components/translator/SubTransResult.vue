<template>
  <div class="sub-result-main-wsrfhedsoufheqiwrhew" :style="opacityStyle">
    <div class="sub-result-main-top-wsrfhedsoufheqiwrhew"></div>
    <div class="sub-result-border-top-bar-wsrfhedsoufheqiwrhew"></div>
    <div class="sub-result-content-box-wsrfhedsoufheqiwrhew" @click.stop="">
      <div class="sub-result-top-wsrfhedsoufheqiwrhew">
        <div class="sub-find-text-wsrfhedsoufheqiwrhew">
          <span :class="translator.canReduceMark ? 'sub-find-text-mark-wsrfhedsoufheqiwrhew' : ''">{{
            translator.subTranslator.selectText
          }}</span>
        </div>
        <div class="sub-top-right-wsrfhedsoufheqiwrhew">
          <IconBtn
            v-if="!translator.canReduceMark"
            type="icon-yibiaoji"
            iconSize="20"
            @click="translator.subTranslator.mark"
          />
          <IconBtn
            v-else
            type="icon-biaoji"
            iconSize="18"
            @click="translator.subTranslator.mark"
          />
          <IconBtn
            type="icon-guanbi"
            iconSize="13"
            @click="translator.subTranslator.init"
          />
        </div>
      </div>
      <div class="sub-sound-bar-wsrfhedsoufheqiwrhew">
        <div class="sub-sound-btn-wsrfhedsoufheqiwrhew">
          <div v-if="showPronunciation" class="sub-pronunciation-wsrfhedsoufheqiwrhew">
            {{ translator.subTranslator.resultData.pronunciation }}
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

<script>
import { defineComponent, inject, computed, reactive, onMounted } from "vue";
import SoundBtn from "./SoundBtn.vue";
import DictItems from "./DictItems.vue";
import Examples from "./Examples.vue";
import IconBtn from "../base/IconBtn.vue";

export default defineComponent({
  setup() {
    const translator = inject("translator");

    const opacityStyle = reactive({
      opacity: 0.2,
    });

    const showPronunciation = computed(() => {
      return (
        translator.subTranslator.resultData.pronunciation &&
        translator.subTranslator.resultData.pronunciation.length < 30
      );
    });

    onMounted(() => {
      setTimeout(() => {
        opacityStyle.opacity = 1;
      });
    });

    return {
      translator,
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
  transition: opacity 0.8s;
  width: 100%;
  height: 100%;
  background-color: rgba(120, 120, 120, 0.1);
  .sub-result-main-top-wsrfhedsoufheqiwrhew {
    height: 55px;
    width: 100%;
    background-color: rgba(0, 0, 0, 0);
    flex-shrink: 0;
  }
  .sub-result-border-top-bar-wsrfhedsoufheqiwrhew {
    box-sizing: border-box;
    border-top: 1px solid #d5d5d5;
    border-left: 1px solid #d5d5d5;
    border-right: 1px solid #d5d5d5;
    border-top-left-radius: $transRadius;
    border-top-right-radius: $transRadius;
    background-color: white;
    height: 5px;
    width: 100%;
    flex-shrink: 0;
  }
}

.sub-result-content-box-wsrfhedsoufheqiwrhew {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  background-color: white;
  padding: 15px $transEdgePadding 20px $transEdgePadding;
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
</style>
