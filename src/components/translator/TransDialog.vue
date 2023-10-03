<template>
  <div
    class="dialog-overlay"
    v-if="baseHook.dialog.show"
    @click="baseHook.dialog.show = false"
  >
    <div class="dialog-content-box" @click.stop="">
      <div class="content-text">
        {{ baseHook.dialog.message }}
      </div>
      <div class="dialog-control-bar">
        <div
          class="cancel"
          :style="baseHook.dialog.confirmText ? 'color: #777;' : ''"
          @click="baseHook.dialog.show = false"
        >
          {{ baseHook.dialog.cancelText }}
        </div>
        <div
          class="comfirm"
          @click="baseHook.dialog.confirmAction"
        >
          {{ baseHook.dialog.confirmText }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent, inject } from "vue";
import { IBaseHook } from "@/interface/trans";

export default defineComponent({
  setup() {
    const baseHook = inject("baseHook") as IBaseHook;

    return {
      baseHook,
    };
  },
});
</script>


<style scoped lang="scss">
// @import "@/app.scss";

.dialog-overlay {
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
  background-color: transparent;
  .dialog-content-box {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: space-between;
    box-sizing: border-box;
    border-radius: 5px;
    padding: 20px 16px 14px 16px;
    min-width: 210px;
    background-color: var(--xx-background-color);
    border: 1px solid var(--xx-border-color);
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    font-size: 14px;
    .content-text {
      padding-bottom: 15px;
      color: var(--xx-text-color-regular);
    }
    .dialog-control-bar {
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      justify-content: flex-end;
      color: var(--xx-c-primary);
      .cancel {
        font-weight: bold;
        padding-right: 10px;
        cursor: pointer;
      }
      .comfirm {
        font-weight: bold;
        cursor: pointer;
      }
    }
  }
}
</style>