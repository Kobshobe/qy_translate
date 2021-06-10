<template>
  <div
    class="popup-overlay-wsrfhedsoufheqiwrhew"
    v-if="
      translator.subTranslator.status !== 'hide' ||
      translator.subTranslator.status === 'loading'
    "
    @click="translator.subTranslator.init"
  >
    <div
      v-if="translator.subTranslator.status !== 'result'"
      class="gate-box-wsrfhedsoufheqiwrhew"
      :style="{ top: translator.subTranslator.top + 'px' }"
    >
      <div :style="{ width: translator.subTranslator.left + 'px' }"></div>
      <div class="gate-content-box-wsrfhedsoufheqiwrhew" @click.stop="">
        <div
          v-if="translator.subTranslator.status === 'showGate'"
          class="gate-trans-mark-wsrfhedsoufheqiwrhew"
        >
          <div class="gate-btn-wsrfhedsoufheqiwrhew" @click="translator.subTranslator.translate">
            翻译
          </div>
          <div class="gate-divider-wsrfhedsoufheqiwrhew">|</div>
          <div class="gate-btn-wsrfhedsoufheqiwrhew" @click="translator.subTranslator.mark">
            {{ translator.canReduceMark ? "取消标记" : "标记" }}
          </div>
        </div>

        <div
          v-else-if="translator.subTranslator.status === 'loading'"
          class="loading-wsrfhedsoufheqiwrhew"
        >
          <Loading />
        </div>
      </div>
    </div>
    <div v-else class="sub-trans-result-box-wsrfhedsoufheqiwrhew">
      
      <SubTransResult />
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent, inject } from "vue";
import Loading from "../base/Loading.vue";
import SubTransResult from "./SubTransResult.vue";

export default defineComponent({
  setup() {
    const translator = inject<any>("translator");

    return {
      translator,
    };
  },
  components: {
    Loading,
    SubTransResult,
  },
});
</script>


<style scoped lang="scss">
@import "../../app.scss";

.popup-overlay-wsrfhedsoufheqiwrhew {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: Arial, Helvetica, sans-serif;
  .gate-box-wsrfhedsoufheqiwrhew {
    box-sizing: border-box;
    position: absolute;
    display: flex;
    left: 0;
    right: 0;
    display: flex;
    padding-right: 15px;
    padding-left: 15px;
    .gate-content-box-wsrfhedsoufheqiwrhew {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 20px;
      background-color: $toastBGC;
      border: $toastBorder;
      color: $toastColor;
      border-radius: 5px;
      padding: 6px 7px 6px 7px;
      flex-shrink: 0;
      height: auto;
      font-size: 13px;
      .gate-trans-mark-wsrfhedsoufheqiwrhew {
        display: flex;
        flex-wrap: nowrap;
        justify-content: center;
        align-items: center;
        .gate-btn-wsrfhedsoufheqiwrhew {
          cursor: pointer;
          // padding-top: 2px;
        }
        .gate-divider-wsrfhedsoufheqiwrhew {
          padding: 0 3px 0 3px;
        }
      }
    }
  }
  .sub-trans-result-box-wsrfhedsoufheqiwrhew {
    width: 100%;
    height: 100%;
  }
  ::-webkit-scrollbar {
    width: 4px;
  }
  /* 滚动槽 */
  ::-webkit-scrollbar-track {
    -webkit-box-shadow: inset006pxrgba(0, 0, 0, 0.3);
    border-radius: 10px;
  }
  /* 滚动条滑块 */
  ::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.1);
    -webkit-box-shadow: inset006pxrgba(0, 0, 0, 0.5);
  }
}
</style>