<template>
  <div class="main-top-tool-bar-wsrfhedsoufheqiwrhew" :style="baseHook.C.mode==='simple' ? '':'height:10px'">
    <div v-if="baseHook.mode !== 'popup'" class="main-top-tool-bar-content-wsrfhedsoufheqiwrhew">
      <div class="main-top-around-box-wsrfhedsoufheqiwrhew" @mouseup.stop=""></div>
      <div class="main-top-move-bar-wsrfhedsoufheqiwrhew" @mousedown.stop="down">
        <div class="move-bar-ui-wsrfhedsoufheqiwrhew"></div>
      </div>
      <div class="main-top-around-box-wsrfhedsoufheqiwrhew" style="justify-content: flex-end">
        <div v-if="baseHook.C.mode === 'simple'" :class="baseHook.isHold ? '' : 'hold-btn-box-wsrfhedsoufheqiwrhew'">
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

<script lang="ts">
import { defineComponent, inject } from "vue";
import {IBaseHook} from '@/utils/interface';
import IconBtn from "../base/IconBtn.vue";

export default defineComponent({
  setup() {
    const baseHook = <IBaseHook>inject('baseHook');

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

    return {
      baseHook,
      down,
    };
  },
  components: {
    IconBtn,
  },
});
</script>


<style scoped lang="scss">
.main-top-tool-bar-wsrfhedsoufheqiwrhew {
  // position: absolute;
  // top: 0;
  // left: 0;
  box-sizing: border-box;
  width: 100%;
  height: 20px;
  .main-top-tool-bar-content-wsrfhedsoufheqiwrhew {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;
    width: 100%;
    .main-top-around-box-wsrfhedsoufheqiwrhew {
        display: flex;
        width: 100%;
        
    }
    .main-top-move-bar-wsrfhedsoufheqiwrhew {
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
      .move-bar-ui-wsrfhedsoufheqiwrhew {
        background-color: #ddd;
        height: 6px;
        width: 70px;
        border-radius: 3px;
      }
    }
    .hold-btn-box-wsrfhedsoufheqiwrhew {
        opacity: 0;
        transition: opacity 0.5s;
    }
  }
  .main-top-tool-bar-content-wsrfhedsoufheqiwrhew:hover .main-top-move-bar-wsrfhedsoufheqiwrhew {
    opacity: 1;
  }
  .main-top-tool-bar-content-wsrfhedsoufheqiwrhew:hover .hold-btn-box-wsrfhedsoufheqiwrhew {
    opacity: 1;
  }
}
</style>