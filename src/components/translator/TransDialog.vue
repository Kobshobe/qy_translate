<template>
  <div
    class="dialog-overlay-wsrfhedsoufheqiwrhew"
    v-if="translator.dialogMsg.show"
    @click="translator.dialogMsg.show = false"
  >
    <div class="dialog-content-box-wsrfhedsoufheqiwrhew" @click.stop="">
      <div class="content-text-wsrfhedsoufheqiwrhew">{{translator.dialogMsg.contentText}}</div>
      <div class="dialog-control-bar-wsrfhedsoufheqiwrhew">
        <div class="cancel-wsrfhedsoufheqiwrhew" @click="translator.dialogMsg.show = false">{{translator.dialogMsg.cancelText}}</div>
        <div class="comfirm-wsrfhedsoufheqiwrhew" @click="translator.dialogMsg.confirmAction">{{translator.dialogMsg.confirmText}}</div>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent, inject } from "vue";

export default defineComponent({
  setup() {
      const translator = inject('translator')

      return {
          translator
      }
  },
});
</script>


<style scoped lang="scss">
@import "../../app.scss";

.dialog-overlay-wsrfhedsoufheqiwrhew {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
//   background-color: rgba(0,0,0,0.5);
  .dialog-content-box-wsrfhedsoufheqiwrhew {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: space-between;
    box-sizing: border-box;
    border-radius: 5px;
    padding: 20px 16px 14px 16px;
    min-height: 120px;
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
      .cancel-wsrfhedsoufheqiwrhew {
          font-weight: bold;
          padding-right: 10px;
          color: #777;
        //   text-decoration: underline;
          cursor: pointer;
      }
      .comfirm-wsrfhedsoufheqiwrhew {
        color: $mainColor;
        font-weight: bold;
        // text-decoration: underline;
        cursor: pointer;
      }
    }
  }
}
</style>