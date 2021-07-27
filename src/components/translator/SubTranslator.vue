<template>
  <div
    class="popup-overlay-wsrfhedsoufheqiwrhew"
    v-if="
      baseHook.T.subTranslator.status !== 'hide'
    "
    @click="baseHook.T.subTranslator.init"
  >
    <div
      v-if="baseHook.T.subTranslator.status !== 'result'"
      class="gate-box-wsrfhedsoufheqiwrhew"
      :style="{ top: baseHook.T.subTranslator.top + 'px' }"
    >
      <div :style="{ width: baseHook.T.subTranslator.left + 'px' }"></div>
      <div class="gate-content-box-wsrfhedsoufheqiwrhew" @click.stop="">
        <div
          v-if="baseHook.T.subTranslator.status === 'showGate'"
          class="gate-trans-mark-wsrfhedsoufheqiwrhew"
        >
          <div class="gate-btn-wsrfhedsoufheqiwrhew" @click="baseHook.T.subTranslator.translate">
            {{subTransMsg}}
          </div>
          <div class="gate-divider-wsrfhedsoufheqiwrhew">|</div>
          <div class="gate-btn-wsrfhedsoufheqiwrhew" @click="baseHook.T.subTranslator.mark">
            {{ baseHook.T.canReduceMark ? reduceMarkMsg : markMsg }}
          </div>
        </div>

        <div
          v-else-if="baseHook.T.subTranslator.status === 'loading'"
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
import {IBaseHook} from '@/interface/trans'

export default defineComponent({
  setup() {
    const baseHook = <IBaseHook>inject("baseHook");

    const markMsg = chrome.i18n.getMessage("mark")
    const subTransMsg = chrome.i18n.getMessage("subTrans")
    const reduceMarkMsg = chrome.i18n.getMessage("reduceMark")

    return {
      baseHook,markMsg,subTransMsg,reduceMarkMsg
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
    box-sizing: border-box;
    padding: 50px 10px 10px 10px;
    overflow: hidden;
    width: 100%;
    height: 100%;
  }
  ::-webkit-scrollbar {
    width: 6px;
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
    -webkit-box-shadow: inset006pxrgba(0, 0, 0, 0.3);
  }
}
</style>