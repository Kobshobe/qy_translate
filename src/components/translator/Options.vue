<template>
  <div
    class="inner-options-main"
    @click="baseHook.T.options.close"
  >
    <div class="option-content" @click.stop="">
      <x-select
        :placeholder="choiceMsg"
        v-model="baseHook.T.options.from"
        @change="baseHook.T.options.close"
        popperPosition="fixed"
      >
        <x-select-option
          v-for="(lang, key, index) in languages"
          :key="index"
          :label="lang[localeLang]"
          :value="key"
          v-show="key !== 'auto' && key !== '__auto__'"
        >
        </x-select-option>
      </x-select>
      <IconBtn
        type="icon-fanyi"
        :rotate="90"
        @click="baseHook.T.options.exchange"
      />
      <x-select
        :placeholder="choiceMsg"
        v-model="baseHook.T.options.to"
        @change="baseHook.T.options.close"
        popperPosition="fixed"
      >
        <x-select-option
          v-for="(lang, key, index) in languages"
          :key="index"
          :label="lang[localeLang]"
          :value="key"
          v-show="key !== 'auto' && key !== '__auto__'"
        >
        </x-select-option>
      </x-select>

      <!-- 翻译源 -->
      <div class="divder-line" @click.stop></div>
      <x-select
        :placeholder="choiceMsg"
        v-model="baseHook.T.options.engine"
        @change="baseHook.T.options.changeEngine"
        popperPosition="fixed"
      >
        <x-select-group
          v-for="group in engineGroups"
          :key="group.code"
          :label="group.label"
        >
          <x-select-option
            v-for="(engine, index) in group.engines"
            :key="index"
            :label="engine.label"
            :value="engine.code"
          >
          </x-select-option>
        </x-select-group>
      </x-select>
      <div class="divder-line"></div>
      <div
        class="more-option"
        @click="baseHook.T.options.openOptionsPage"
      >
        {{ moreMsg }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, inject, ref, watch } from "vue";
import IconBtn from "../base/IconBtn.vue";
import { languages, engines } from "@/translator/trans_base";
import { IBaseHook, ILLMConfig } from "@/interface/trans";
import { getLocaleLang, geti18nMsg } from "@/utils/share";

const baseHook = inject("baseHook") as IBaseHook;
const choiceMsg = chrome.i18n.getMessage("__choice__");
const localeLang = getLocaleLang();
const moreMsg = chrome.i18n.getMessage("moreOption");

interface EngineItem {
  code: string
  label: string
}

interface EngineGroup {
  code: string
  label: string
  engines: EngineItem[]
}

const engineGroups = ref<EngineGroup[]>([])

function buildEngineGroups(llmConfigs: ILLMConfig[]): EngineGroup[] {
  return engines
    .map((group: any) => {
      if (group.code === '__llm__') {
        const llmEngines: EngineItem[] = llmConfigs.map((cfg: ILLMConfig) => ({
          code: 'llm__' + cfg.id,
          label: cfg.name
        }))
        return {
          code: group.code,
          label: geti18nMsg(group.code),
          engines: llmEngines
        }
      }
      // For __commonTrans__ group
      const groupEngines: EngineItem[] = Object.values(group.engines).map((e: any) => ({
        code: e.code,
        label: geti18nMsg(e.code)
      }))
      return {
        code: group.code,
        label: geti18nMsg(group.code),
        engines: groupEngines
      }
    })
    // Hide empty groups (e.g. __llm__ when no configs exist)
    .filter((group: EngineGroup) => group.engines.length > 0)
}

async function refreshEngineGroups() {
  try {
    const result = await chrome.storage.sync.get('llmConfigs')
    const configs: ILLMConfig[] = result.llmConfigs || []
    engineGroups.value = buildEngineGroups(configs)
  } catch (e) {
    // Fallback: use empty LLM list
    engineGroups.value = buildEngineGroups([])
  }
}

// Refresh when the options panel becomes visible
watch(() => baseHook.T.options.isShow, (isShow) => {
  if (isShow) {
    refreshEngineGroups()
  }
})

// Initial load
refreshEngineGroups()
</script>


<style scoped lang="scss">
.inner-options-main {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  border-radius: 8px;
  background-color: transparent;
  .option-content {
    box-sizing: border-box;
    position: absolute;
    right: 16px;
    bottom: 16px;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: center;
    width: 148px;
    padding: 5px 9px 9px 9px;
    background-color:  var(--xx-background-color);
    border-radius: 8px;
    border: $normalBorder;
    box-shadow: $normalBoxShadow;
    .divder-line {
      background-color: var(--xx-border-color);
      height: 1px;
      width: 100%;
    }
    .more-option {
      margin-top: 7px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      font-size: 14px;
      color: var(--xx-text-color-regular);
      height: 20px;
    }
    ::v-deep(.xx-input__wrapper) {
      padding: 0;
    }
    ::v-deep(.xx-input__inner) {
      height: 50px;
    }
    ::v-deep(.xx-select__wrapper) {
      border: none;
      width: 100%;
      input {
        text-align: center !important;
        height: 100% !important;
        // background-color: white !important;
        color: $mainColor !important;
        font-weight: bold !important;
        padding: 0 !important;
        margin: 0 !important;
        box-shadow: none !important;
      }
      input:focus {
        border: none !important;
        text-align: center !important;
        box-shadow: none !important;
        outline: none !important;
      }
    }
    ::v-deep(.xx-select-input__suffix) {
      display: none!important;;
    }
  }
}
</style>