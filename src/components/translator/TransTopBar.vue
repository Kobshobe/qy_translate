<template>
  <div class="main-top-tool-bar" :style="baseHook.C.mode==='simple' ? '':'height:10px'">
    <div v-if="baseHook.mode !== 'popup'" class="main-top-tool-bar-content">
      <div class="main-top-around-box" @mouseup.stop=""></div>
      <div class="main-top-move-bar" @mousedown.stop="down">
        <div class="move-bar-ui"></div>
      </div>
      <div class="main-top-around-box" style="justify-content: flex-end">
        <div v-if="baseHook.C.mode === 'simple'" :class="baseHook.isHold ? '' : 'hold-btn-box'">
          <IconBtn
            type="icon-269"
            :color="baseHook.isHold ? '#4C8BF5' : '#ccc'"
            :rotate="baseHook.isHold ? -45 : 0"
            @click="baseHook.setHold"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, inject } from "vue";
import {IBaseHook} from '@/interface/trans';
import IconBtn from "../base/IconBtn.vue";

const baseHook = inject('baseHook') as IBaseHook;

const resultStyle =
  baseHook.mode !== "popup" ? inject<any>("resultStyle") : null;

const down = (e: any) => {
  const xDist = e.clientX - parseInt(resultStyle.left);
  const yDist = e.clientY - parseInt(resultStyle.top);

  document.onmouseup = () => {
    document.onmousemove = null;
  };
  document.onmousemove = (e) => {
    resultStyle.left = `${e.clientX - xDist}px`;
    resultStyle.top = `${e.clientY - yDist}px`;
  };
  resultStyle.moveBarTap()
};
</script>


<style scoped lang="scss">
.main-top-tool-bar {
  box-sizing: border-box;
  width: 100%;
  height: 20px;
  .main-top-tool-bar-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;
    width: 100%;
    .main-top-around-box {
        display: flex;
        width: 100%;
        
    }
    .main-top-move-bar {
      box-sizing: border-box;
      display: flex;
      width: 70%;
      height: 100%;
      flex-shrink: 0;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.5s;
      .move-bar-ui {
        // background-color: #ddd;
        background-color: var(--xx-border-color);
        height: 6px;
        width: 70px;
        border-radius: 3px;
      }
    }
    .hold-btn-box {
        opacity: 0;
        transition: opacity 0.5s;
    }
  }
  .main-top-tool-bar-content:hover .main-top-move-bar {
    opacity: 1;
  }
  .main-top-tool-bar-content:hover .hold-btn-box {
    opacity: 1;
  }
}
</style>