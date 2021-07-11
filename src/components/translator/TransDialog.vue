<template>
  <div
    class="dialog-overlay-wsrfhedsoufheqiwrhew"
    v-if="transHook.dialogMsg.show"
    @click="transHook.dialogMsg.show = false"
  >
    <div class="dialog-content-box-wsrfhedsoufheqiwrhew" @click.stop="">
      <div class="content-text-wsrfhedsoufheqiwrhew">{{transHook.dialogMsg.message}}</div>
      <div class="dialog-control-bar-wsrfhedsoufheqiwrhew">
        <div class="cancel-wsrfhedsoufheqiwrhew" :style="transHook.dialogMsg.confirmText ? 'color: #777;':''" @click="transHook.dialogMsg.show = false">{{transHook.dialogMsg.cancelText}}</div>
        <div class="comfirm-wsrfhedsoufheqiwrhew" @click="transHook.dialogMsg.confirmAction">{{transHook.dialogMsg.confirmText}}</div>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent, inject } from "vue";
import {ITranslatorHook} from '@/utils/interface';

export default defineComponent({
  setup() {
      const transHook = <ITranslatorHook>inject('transHook')

      return {
          transHook
      }
  },
});
</script>


<style scoped lang="scss">
@import "../../app.scss";

.dialog-overlay-wsrfhedsoufheqiwrhew {
  box-sizing: border-box;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 20px 0 20px;
//   background-color: rgba(0,0,0,0.5);
  .dialog-content-box-wsrfhedsoufheqiwrhew {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: space-between;
    box-sizing: border-box;
    border-radius: 5px;
    padding: 20px 16px 14px 16px;
    min-width: 210px;
    background-color: white;
    // box-shadow: 0 0 20px #555;
    border: solid 1px #E4E7ED;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    font-size: 14px;
    .content-text-wsrfhedsoufheqiwrhew {
      padding-bottom: 15px;
      color: #555;
    }
    .dialog-control-bar-wsrfhedsoufheqiwrhew {
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      justify-content: flex-end;
      color: $mainColor;
      .cancel-wsrfhedsoufheqiwrhew {
          font-weight: bold;
          padding-right: 10px;
          cursor: pointer;
      }
      .comfirm-wsrfhedsoufheqiwrhew {
        font-weight: bold;
        cursor: pointer;
      }
    }
  }
}
</style>