<template>
  <div v-show="baseHook.status === 'result'">
    <LangController v-if="baseHook.C.mode === 'profession'" />
    <div
      class="result-main"
    >
      <div
        class="
          text-container
          text-container-top
        "
      >
        <div class="found-result-text" ref="findTextDOM">
          <FindText mode="foundText" />
        </div>
        <div class="tool-bar">
          <div class="tool-bar-left">
            <SoundBtn audioType="from" />
            <div class="edge-width"></div>
            <CollectBtn
              :isCollected="baseHook.T.find.isCollected"
              @collect="baseHook.T.collect({})"
              @reduceCollect="baseHook.T.reduceCollect"
            />
          </div>
          <div class="tool-bar-right">
            <!-- <div class="lang-tips">English</div> -->
            <IconBtn
              v-if="baseHook.T.base.mode === 'popup' || baseHook.C.mode === 'profession'"
              type="icon-bianji1"
              :iconSize="16"
              @click="baseHook.T.toEdit"
            />
          </div>
        </div>
      </div>
      <Divider />
      <div class="text-container">
        <div class="found-result-text">
          <div style="height: 18px"></div>
          <FindText mode="resultText" />
        </div>
        <div class="tool-bar">
          <div class="tool-bar-left">
            <SoundBtn audioType="to" />
            <div style="width: 10px"></div>
            <IconBtn
              type="icon-fuzhi3"
              :iconSize="15"
              @click="baseHook.T.copyResult"
            />
          </div>
          <div class="tool-bar-right">
            <div class="lang-tips">{{resultLang}}</div>
            <x-tooltip
              v-if="baseHook.tips.message !== ''"
              :content="baseHook.tips.message"
              placement="top-end"
              :visible="true"
              trigger="click"
            >
              <IconBtn type="icon-tishi" :iconSize="15" color="#FFB715"  @click="baseHook.openOptionsPage('tipTool')" />
            </x-tooltip>
            <!-- <div>{{ engineIcon }}</div> -->
            <div class="engine-icon-btn" @click="baseHook.T.options.show">
              <IconBtn
                :type="engineIconType || engineIcon"
                :iconSize="15"
              />
            </div>
          </div>
        </div>
        <div style="height: 8px"></div>
      </div>
      <SubTranslator />
    </div>
  </div>
  <Options v-if="baseHook.T.options.isShow" :mode="baseHook.T.base.mode" />
</template>

<script setup lang="ts">
import {
  inject,
  onMounted,
  ref,
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
import {languages, getTransEngineIcon, getLLMProviderIconType} from '@/translator/trans_base'

const baseHook = inject("baseHook") as IBaseHook;
if (!baseHook.T) {
  baseHook.T = transHook(baseHook);
}

const resultLang = computed(() => {
  if(!baseHook.T.find.result) return '';

  if(baseHook.C.mode === 'simple') {
    if((baseHook.T.find.result.resultFrom !== baseHook.C.mainLang && baseHook.T.find.result.resultFrom !== baseHook.C.secondLang) ||
    (baseHook.T.find.result.resultTo !== baseHook.C.mainLang && baseHook.T.find.result.resultTo !== baseHook.C.secondLang)) {
      //@ts-ignore
      return `${languages[baseHook.T.find.result.resultFrom].en} > ${languages[baseHook.T.find.result.resultTo].en}`
    }
  }
  return ''
})

// Engine icon in the bottom-right corner: shows the LLM provider logo when the
// engine is an LLM one (llm__<provider>_<uuid>), otherwise the generic icon.
// `engineIconType` holds the SvgIcon type (e.g. 'llm_openai') resolved
// asynchronously from storage; falls back to `engineIcon` (generic).
const engineIcon = ref(getTransEngineIcon(baseHook.C.transEngine ?? ''))
const engineIconType = ref('')
async function refreshEngineIcon() {
  const engine = baseHook.C.transEngine ?? ''
  engineIcon.value = getTransEngineIcon(engine)
  engineIconType.value = ''
  if (engine.startsWith('llm__')) {
    engineIconType.value = await getLLMProviderIconType(engine)
  }
}
watch(() => baseHook.C.transEngine, refreshEngineIcon, { immediate: true })

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
</script>


<style lang="scss" scoped>
.result-main {
  position: relative;
  color: var(--xx-common-text-color);
  .text-container {
    box-sizing: border-box;
    width: 100%;
  }

  .tool-bar {
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 38px;
    width: 100%;
    padding-top: 10px;
    padding-bottom: 10px;
    padding: 0 $transEdgePadding 0 $transEdgePadding;
    .tool-bar-left {
      display: flex;
      height: 100%;
      align-items: center;
    }
    .tool-bar-right {
      display: flex;
      height: 100%;
      align-items: center;
      .lang-tips {
        color: #999;
        font-size: 12px;
      }
      .engine-icon-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        background-color: transparent;
      }
    }
  }
}

.edge-width {
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
</style>@/translator/trans_base