<template>
  <div v-show="baseHook.status === 'result'">
    <LangController v-if="baseHook.C.mode === 'profession'" />
    <div
      class="result-main-wsrfhedsoufheqiwrhew"
    >
      <div
        class="
          text-container-wsrfhedsoufheqiwrhew
          text-container-top-wsrfhedsoufheqiwrhew
        "
      >
        <div class="found-result-text-wsrfhedsoufheqiwrhew" ref="findTextDOM">
          <FindText mode="foundText" />
        </div>
        <div class="tool-bar-wsrfhedsoufheqiwrhew">
          <div class="tool-bar-left-wsrfhedsoufheqiwrhew">
            <SoundBtn audioType="from" />
            <div class="edge-width-wsrfhedsoufheqiwrhew"></div>
            <CollectBtn
              :isCollected="baseHook.T.find.isCollected"
              @collect="baseHook.T.collect({})"
              @reduceCollect="baseHook.T.reduceCollect"
            />
          </div>
          <div class="tool-bar-right-wsrfhedsoufheqiwrhew">
            <!-- <div class="lang-tips">English</div> -->
            <IconBtn
              v-if="baseHook.T.base.mode === 'popup' || baseHook.C.mode === 'profession'"
              type="icon-bianji1"
              iconSize="16"
              @click="baseHook.T.toEdit"
            />
          </div>
        </div>
      </div>
      <Divider />
      <div class="text-container-wsrfhedsoufheqiwrhew">
        <div class="found-result-text-wsrfhedsoufheqiwrhew">
          <div style="height: 18px"></div>
          <FindText mode="resultText" />
        </div>
        <div class="tool-bar-wsrfhedsoufheqiwrhew">
          <div class="tool-bar-left-wsrfhedsoufheqiwrhew">
            <SoundBtn audioType="to" />
            <div style="width: 10px"></div>
            <IconBtn
              type="icon-fuzhi3"
              iconSize="15"
              @click="baseHook.T.copyResult"
            />
          </div>
          <div class="tool-bar-right-wsrfhedsoufheqiwrhew">
            <div class="lang-tips">{{resultLang}}</div>
            <el-tooltip
              v-if="baseHook.tips.message !== ''"
              class="item"
              effect="dark"
              :content="baseHook.tips.message"
              placement="top-end"
            >
              <IconBtn type="icon-tishi" iconSize="15" color="#FFB715"  @click="baseHook.openOptionsPage('tipTool')" />
            </el-tooltip>
            <IconBtn
              type="icon-gengduo1"
              iconSize="17"
              @click="baseHook.T.options.show"
            />
          </div>
        </div>
        <div style="height: 8px"></div>
      </div>
      <SubTranslator />
    </div>
  </div>
  <Options v-if="baseHook.T.options.isShow" :mode="baseHook.T.base.mode" />
</template>

<script lang="ts">
import {
  defineComponent,
  inject,
  onMounted,
  watch,
  onUnmounted,
  computed
} from "vue";
import { transHook } from "@/hook/translatorHook";
import LangController from "./LangController.vue";
import IconBtn from "../base/IconBtn.vue";
import SoundBtn from "./SoundBtn.vue";
import CollectBtn from "./CollectBtn.vue";
import Options from "./Options.vue";
import SubTranslator from "./SubTranslator.vue";
import FindText from "./FindText.vue";
import Divider from "./Divider.vue";
import { IBaseHook } from "@/interface/trans";
import {languages} from '@/translator/language'

export default defineComponent({
  setup() {
    const baseHook = inject("baseHook") as IBaseHook;
    if (!baseHook.T) {
      baseHook.T = transHook(baseHook);
    }

    const resultLang = computed(() => {
      if(!baseHook.T.find.result) return ''
      if(baseHook.C.mode === 'simple') {
        if((baseHook.T.find.result.resultFrom !== baseHook.C.mainLang && baseHook.T.find.result.resultFrom !== baseHook.C.secondLang) ||
        (baseHook.T.find.result.resultTo !== baseHook.C.mainLang && baseHook.T.find.result.resultTo !== baseHook.C.secondLang)) {
          //@ts-ignore
          return `${languages[baseHook.T.find.result.resultFrom].en} > ${languages[baseHook.T.find.result.resultTo].en}`
        }
        return ''
      }
    })

    watch(
      () => baseHook.T.subTranslator.selectText,
      (newVal: string) => {
        if (newVal !== "") {
          baseHook.T.subTranslator.status = "showGate";
        }
      }
    );

    function messageHandler(event: any) {
      if (
        !event.data.sourceID &&
        event.data.sourceID !== "dsfiuasguwheuirhudfkssdhfiwehri"
      ) {
        return;
      }
      if (event.data.action === "playAudio") {
        baseHook.T.getTTS(event.data.audioType, event.data.id);
      }
    }

    onMounted(() => {
      window.addEventListener("message", messageHandler);
      baseHook.T.setResultPostion();
    });

    onUnmounted(() => {
      window.removeEventListener("message", messageHandler);
    });

    return {
      baseHook,
      resultLang
    };
  },
  components: {
    SoundBtn,
    CollectBtn,
    IconBtn,
    Options,
    SubTranslator,
    FindText,
    Divider,
    LangController,
  },
});
</script>


<style lang="scss" scoped>
// @import "../../app.scss";

.result-main-wsrfhedsoufheqiwrhew {
  position: relative;
  color: white;
  .text-container-wsrfhedsoufheqiwrhew {
    box-sizing: border-box;
    width: 100%;
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
      .lang-tips {
        color: #999;
        font-size: 12px;
      }
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