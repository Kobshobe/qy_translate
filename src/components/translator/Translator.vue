<template>
  <div>
    <div class="tool-trans-main-wsrfhedsoufheqiwrhew">
      <TransTopBar />
      <div class="transHook-main-wsrfhedsoufheqiwrhew" @mouseup.stop="up">
        <Editor v-if="baseHook.status === 'editing'" />
        <TransResult v-if="baseHook.isResultInit" />
      </div>
    </div>
    <TransDialog />
    <TransToast />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  inject,
} from "vue";
import Editor from "./Editor.vue";
import TransResult from "./TransResult.vue";
import TransTopBar from "./TransTopBar.vue";
import TransDialog from "./TransDialog.vue";
import TransToast from "./TransToast.vue";
import LangController from "./LangController.vue";
import { IBaseHook } from "@/interface/trans";

export default defineComponent({
  setup() {
    const baseHook = inject("baseHook") as IBaseHook;

    function up() {
      document.onmousemove = null;
    }

    return {
      baseHook,
      up,
    };
  },
  components: {
    TransTopBar,
    Editor,
    TransResult,
    TransDialog,
    TransToast,
    LangController,
  },
});
</script>

<style scoped lang='scss'>
@import "../../app.scss";

::v-deep(*) {
  padding: 0;
  margin: 0;
  background-color: rgba(0, 0, 0, 0);
  font-weight: normal;
  font-family: Arial, Helvetica, sans-serif;
  font-style: normal;
  line-height: normal;
  list-style: none;
  text-align: left;
}

.tool-trans-main-wsrfhedsoufheqiwrhew {
  position: relative;
  width: 100%;
  height: 100%;
  .transHook-main-wsrfhedsoufheqiwrhew {
    position: relative;
    width: 100%;
    height: 100%;
    // font-weight: normal;
    // font-family: Arial, Helvetica, sans-serif;
    // font-style: normal;
    // line-height: normal;
    // text-align: left;
  }
}
</style>

