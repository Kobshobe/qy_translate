<template>
  <div class="tool-trans-main-wsrfhedsoufheqiwrhew">
    <TransTopBar :mode="transHook.mode" :uiMode="transHook.conf.C.mode" />
    <LangController v-if="transHook.conf.C.mode !== 'simple'" />
    <div class="transHook-main-wsrfhedsoufheqiwrhew" @mouseup.stop="up">
      <TransResult v-if="transHook.status !== 'editing'" />
      <Editor v-else />
      <Options v-if="transHook.options.isShow" :mode="transHook.mode" />
      <SubTranslator />
      <TransDialog />
      <TransToast />
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  inject,
  onMounted,
  onUnmounted,
  provide,
  ref,
} from "vue";
import IconBtn from "../base/IconBtn.vue";
import SoundBtn from "./SoundBtn.vue";
import TransTopBar from './TransTopBar.vue';
import CollectBtn from "./CollectBtn.vue";
import Options from "./Options.vue";
import TransDialog from "./TransDialog.vue";
import TransToast from "./TransToast.vue";
import SubTranslator from "./SubTranslator.vue";
import FindText from "./FindText.vue";
import Editor from "./Editor.vue";
import TransResult from "./TransResult.vue";
import LangController from "./LangController.vue";
import { ITranslatorHook } from "@/utils/interface";

export default defineComponent({
  emits: ["loadOK"],
  setup(props, context) {
    const transHook = <ITranslatorHook>inject("transHook");

    function messageHandler(event: any) {
      if (
        !event.data.sourceID &&
        event.data.sourceID !== "dsfiuasguwheuirhudfkssdhfiwehri"
      ) {
        return;
      }
      if (event.data.action === "playAudio") {
        transHook.getTTS(event.data.audioType, event.data.id);
      }
    }

    onMounted(() => {
      context.emit("loadOK");
      window.addEventListener("message", messageHandler);
    });

    onUnmounted(() => {
      window.removeEventListener("message", messageHandler);
    });

    function up() {
      document.onmousemove = null;
    }

    return {
      transHook,
      up,
    };
  },
  components: {
    TransTopBar,
    SoundBtn,
    CollectBtn,
    IconBtn,
    Options,
    TransDialog,
    TransToast,
    SubTranslator,
    FindText,
    Editor,
    TransResult,
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

