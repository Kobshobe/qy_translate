<template>
  <div
    class="popup-overlay"
    v-if="
      baseHook.T.subTranslator.status !== 'hide'
    "
    @click="baseHook.T.subTranslator.init"
  >
    <div
      v-if="baseHook.T.subTranslator.status !== 'result'"
      class="gate-box"
      :style="{ top: baseHook.T.subTranslator.top + 'px' }"
    >
      <div :style="{ width: baseHook.T.subTranslator.left + 'px', backgroundColor: 'transparent' }"></div>
      <div class="gate-content-box" @click.stop="">
        <div
          v-if="baseHook.T.subTranslator.status === 'showGate'"
          class="gate-trans-mark"
        >
          <div class="gate-btn" @click="baseHook.T.subTranslator.translate">
            {{subTransMsg}}
          </div>
          <div class="gate-divider">|</div>
          <div class="gate-btn" @click="baseHook.T.subTranslator.mark">
            {{ baseHook.T.canReduceMark ? reduceMarkMsg : markMsg }}
          </div>
        </div>

        <div
          v-else-if="baseHook.T.subTranslator.status === 'loading'"
          class="qy-sub-loading"
        >
          <Loading />
        </div>
      </div>
    </div>
    <div v-else class="sub-trans-result-box">
      <SubTransResult />
    </div>
  </div>
</template>

<script setup lang='ts'>
import { inject } from "vue";
import Loading from "../base/Loading.vue";
import SubTransResult from "./SubTransResult.vue";
import {IBaseHook} from '@/interface/trans'

const baseHook = inject("baseHook") as IBaseHook

const markMsg = chrome.i18n.getMessage("mark")
const subTransMsg = chrome.i18n.getMessage("subTrans")
const reduceMarkMsg = chrome.i18n.getMessage("reduceMark")
</script>


<style scoped lang="scss">

.popup-overlay {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: Arial, Helvetica, sans-serif;
  background-color: rgba(0, 0, 0, 0);
  .gate-box {
    box-sizing: border-box;
    position: absolute;
    display: flex;
    left: 0;
    right: 0;
    display: flex;
    padding-right: 15px;
    padding-left: 15px;
    background-color: transparent;
    .gate-content-box {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 20px;
      background-color: var(--xx-fill-color-2);
      border: $toastBorder;
      color: $toastColor;
      border-radius: 5px;
      padding: 6px 7px 6px 7px;
      flex-shrink: 0;
      height: auto;
      font-size: 13px;
      .gate-trans-mark {
        display: flex;
        flex-wrap: nowrap;
        justify-content: center;
        align-items: center;
        background-color: var(--xx-fill-color-2);
        color: var(--xx-text-color-regular);
        .gate-btn {
          cursor: pointer;
          background-color: var(--xx-fill-color-2);
        }
        .gate-divider {
          padding: 0 3px 0 3px;
          background-color: var(--xx-fill-color-2);
        }
      }
      .qy-sub-loading {
        background-color: transparent;
      }
    }
  }
  .sub-trans-result-box {
    box-sizing: border-box;
    padding: 50px 10px 10px 10px;
    overflow: hidden;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0);
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