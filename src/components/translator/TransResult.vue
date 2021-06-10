<template>
  <div class="result-main-wsrfhedsoufheqiwrhew">
    <div class="text-container-wsrfhedsoufheqiwrhew text-container-top-wsrfhedsoufheqiwrhew">
      <div class="found-result-text-wsrfhedsoufheqiwrhew" ref="findTextDOM">
        <FindText mode="foundText" />
      </div>
      <div class="tool-bar-wsrfhedsoufheqiwrhew">
        <div class="tool-bar-left-wsrfhedsoufheqiwrhew">
          <SoundBtn audioType="from" />
          <div class="edge-width-wsrfhedsoufheqiwrhew"></div>
          <CollectBtn
            :isCollected="translator.find.isCollected"
            @collect="translator.collect({})"
            @reduceCollect="translator.reduceCollect"
          />
        </div>
        <div class="tool-bar-right-wsrfhedsoufheqiwrhew">
          <IconBtn
            v-if="translator.mode !== 'resultOnly'"
            type="icon-bianji1"
            iconSize="16"
            @click="translator.toEdit"
          />
        </div>
      </div>
      <div class="divider-wsrfhedsoufheqiwrhew"></div>
    </div>

    <div class="text-container-wsrfhedsoufheqiwrhew">
      <div class="found-result-text-wsrfhedsoufheqiwrhew">
        <div style="height:18px"></div>
        <FindText mode="resultText" />
      </div>
      <div class="tool-bar-wsrfhedsoufheqiwrhew">
        <div class="tool-bar-left-wsrfhedsoufheqiwrhew">
          <SoundBtn audioType="to" />
          <div style="width: 10px"></div>
          <IconBtn
            type="icon-fuzhi3"
            iconSize="15"
            @click="translator.copyResult"
          />
        </div>
        <div class="tool-bar-right-wsrfhedsoufheqiwrhew">
          <IconBtn
            type="icon-gengduo1"
            iconSize="17"
            @click="translator.options.show"
          />
        </div>
      </div>
      <div style="height: 8px"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject } from "vue";
import IconBtn from "../base/IconBtn.vue";
import SoundBtn from "./SoundBtn.vue";
import CollectBtn from "./CollectBtn.vue";
import Options from "./Options.vue";
import SubTranslator from "./SubTranslator.vue";
import FindText from "./FindText.vue";
import { ITranslatorHook } from "@/utils/interface";

export default defineComponent({
  setup() {
    const translator = <ITranslatorHook>inject("translator");

    return {
      translator,
    };
  },
  components: {
    SoundBtn,
    CollectBtn,
    IconBtn,
    Options,
    SubTranslator,
    FindText,
  },
});
</script>


<style lang="scss" scoped>
@import "../../app.scss";

.result-main-wsrfhedsoufheqiwrhew {
  .text-container-wsrfhedsoufheqiwrhew {
    box-sizing: border-box;
    width: 100%;
  }
  .divider-wsrfhedsoufheqiwrhew {
    width: 100%;
    height: 4px;
    background-color: #f2f2f2;
  }

  .tool-bar-wsrfhedsoufheqiwrhew {
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 38px;
    width: 100%;
    padding-top: 10px;
    padding-bottom: 10px;
    padding: 0 $transEdgePadding 0 $transEdgePadding;
    .tool-bar-left-wsrfhedsoufheqiwrhew {
      display: flex;
      height: 100%;
      align-items: center;
    }
    .tool-bar-right-wsrfhedsoufheqiwrhew {
      display: flex;
      height: 100%;
      align-items: center;
    }
  }
}

.edge-width-wsrfhedsoufheqiwrhew {
  min-width: 10px;
}

::-webkit-scrollbar {
  width: 4px;
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
  -webkit-box-shadow: inset006pxrgba(0, 0, 0, 0.5);
}
</style>