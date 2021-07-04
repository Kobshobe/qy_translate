<template>
  <div class="translator-main-wsrfhedsoufheqiwrhew" @mouseup.stop="up">
    <TransTopBar :mode="translator.mode" />
    <TransResult v-if="translator.status !== 'editing'" />
    <Editor v-else />
    <Options v-if="translator.options.isShow" :mode="translator.mode" />
    <SubTranslator />
    <TransDialog />
    <TransToast />
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
import CollectBtn from "./CollectBtn.vue";
import Options from "./Options.vue";
import TransDialog from "./TransDialog.vue";
import TransToast from "./TransToast.vue";
import SubTranslator from "./SubTranslator.vue";
import FindText from "./FindText.vue";
import TransTopBar from "./TransTopBar.vue";
import Editor from "./Editor.vue";
import TransResult from "./TransResult.vue";
import { ITranslatorHook } from "@/utils/interface";

export default defineComponent({
  emits: ["loadOK"],
  setup(props, context) {
    const translator = <ITranslatorHook>inject("translator");

    function messageHandler(event: any) {
      if (
        !event.data.sourceID &&
        event.data.sourceID !== "dsfiuasguwheuirhudfkssdhfiwehri"
      ) {
        return;
      }
      if (event.data.action === "playAudio") {
        translator.getTTS(event.data.audioType, event.data.id);
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
      translator,
      up,
    };
  },
  components: {
    SoundBtn,
    CollectBtn,
    IconBtn,
    Options,
    TransDialog,
    TransToast,
    SubTranslator,
    FindText,
    TransTopBar,
    Editor,
    TransResult,
  },
});
</script>

<style scoped lang='scss'>
@import "../../app.scss";

.translator-main-wsrfhedsoufheqiwrhew {
  position: relative;
  width: 100%;
  height: 100%;
  // font-weight: normal;
  // font-family: Arial, Helvetica, sans-serif;
  // font-style: normal;
  // line-height: normal;
  // text-align: left;
}
::v-deep(*) {
  padding: 0;
  margin: 0;
  background-color: rgba(0,0,0,0);
  font-weight: normal;
  font-family: Arial, Helvetica, sans-serif;
  font-style: normal;
  line-height: normal;
  text-align: left;
}
</style>

