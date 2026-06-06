<template>
  <div class="option-container">
    <OptionItem :title="`${geti18nMsg('__defaultTransEngine__')}:`">
      <x-select
        v-model="hook.OP.conf.C.transEngine"
        :placeholder="geti18nMsg('__choice__')"
        @change="onEngineChange"
      >
        <x-select-group
          v-for="group in engines"
          :key="group.code"
          :label="group.code === '__llm__' ? geti18nMsg('__llm__') : geti18nMsg(group.code)"
        >
          <x-select-option
            v-if="group.code !== '__llm__'"
            v-for="(engine, _, index) in group.engines"
            :key="index"
            :label="geti18nMsg(engine.code)"
            :value="engine?.code"
          >
          </x-select-option>
          <!-- LLM engines (dynamic from storage) -->
          <x-select-option
            v-if="group.code === '__llm__'"
            v-for="llm in llmList"
            :key="llm.id"
            :label="llm.name"
            :value="'llm__' + llm.id"
          >
          </x-select-option>
          <div
            v-if="group.code === '__llm__'"
            class="add-more-entry"
            @click.stop="goToLLM"
          >+ {{ geti18nMsg('__addMore__') }}</div>
        </x-select-group>
      </x-select>
    </OptionItem>
    <OptionItem :title="`${geti18nMsg('__interface__')}:`">
      <x-radio
        v-model="hook.OP.conf.C.mode"
        label="simple"
        @change="hook.OP.conf.changeMode"
        >{{ geti18nMsg("__simpleAndIntellgent__") }}</x-radio
      >
      <x-size-box width="30px" />
      <x-radio
        v-model="hook.OP.conf.C.mode"
        label="profession"
        @change="hook.OP.conf.changeMode"
        >{{ geti18nMsg("__profession__") }}</x-radio
      >
    </OptionItem>
    <OptionItem :title="`${geti18nMsg('__defaultLang__')}:`">
      <div class="two-lang-wrap">
        <div class="lang-box">
          <div class="lang-title">{{ geti18nMsg("mainLang") }}</div>
          <x-select
            v-model="hook.OP.conf.C.mainLang"
            :placeholder="geti18nMsg('__choice__')"
            @change="hook.OP.conf.changeMainLang"
            filterable
            size="default"
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
        </div>
        <div class="lang-box">
          <div class="lang-title">{{ geti18nMsg("secondLang") }}</div>
          <x-select
            v-model="hook.OP.conf.C.secondLang"
            :placeholder="geti18nMsg('__choice__')"
            @change="hook.OP.conf.changeSecondLang"
            filterable
            size="default"
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
        </div>
      </div>
    </OptionItem>
    <OptionItem :title="`${geti18nMsg('__transMethods__')}:`">
      <x-checkbox
        v-model="hook.OP.conf.C.isTreadWord"
        @change="hook.OP.conf.changeTreadWord"
        >{{ geti18nMsg("treadWord") }}</x-checkbox
      >
      <x-size-box width="30px" />
      <x-checkbox
        v-model="hook.OP.conf.C.menuTrans"
        @change="hook.OP.conf.changeMenuTrans"
        >{{ geti18nMsg("__menuTrans__") }}</x-checkbox
      >
    </OptionItem>
    <OptionItem :title="`${geti18nMsg('__enterTrans__')}:`">
      <x-radio
        v-model="hook.OP.conf.C.keyDownTrans"
        label="Enter"
        @change="hook.OP.conf.changeKeyDownTrans"
        >Enter</x-radio
      >
      <x-size-box width="30px" />
      <x-radio
        v-model="hook.OP.conf.C.keyDownTrans"
        label="Shift+Enter"
        @change="hook.OP.conf.changeKeyDownTrans"
        >Shift+Enter</x-radio
      >
    </OptionItem>
    <OptionItem :title="`${geti18nMsg('__transItemDisplay__')}:`">
      <x-checkbox
        v-model="hook.OP.conf.C.showProun"
        @change="hook.OP.conf.changeShowProun"
        >{{ geti18nMsg("__showProun__") }}</x-checkbox
      >
    </OptionItem>
  </div>
</template>

<script setup lang="ts">
import { inject, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import OptionItem from "@/options/components/OptionItem.vue";
import { languages, engines } from "@/translator/trans_base";
import { IOptionBaseHook } from "@/interface/options";
import { ILLMConfig } from "@/interface/trans";
import { getLocaleLang, geti18nMsg } from "@/utils/share";

const hook = inject("baseHook") as IOptionBaseHook;
const localeLang = getLocaleLang();
const router = useRouter();

function goToLLM() {
  router.push('/llm')
}

function onEngineChange() {
  if (hook.OP.conf.C.transEngine === '__add_more__') {
    router.push('/llm')
    return
  }
  hook.OP.conf.changeTransEngine()
}

const llmList = ref<ILLMConfig[]>([])

async function loadLLMList() {
  const result = await chrome.storage.sync.get('llmConfigs')
  const data = result.llmConfigs || []
  llmList.value = Array.isArray(data) ? data : []
}

onMounted(() => {
  loadLLMList()
})
</script>


<style scoped lang='scss'>
.option-container {
  box-sizing: border-box;
  width: 100%;
  padding: 70px 0 150px 100px;
}

.colume-option {
  display: flex;
  flex-wrap: nowrap;
}

.two-lang-wrap {
  display: flex;
  .lang-box {
    width: 250px;
    .lang-title {
      padding-bottom: 20px;
      color: #666;
      font-size: 14px;
    }
  }
}

.add-more-entry {
  padding: 0 20px;
  height: 32px;
  line-height: 32px;
  font-size: 13px;
  color: var(--xx-c-primary);
  cursor: pointer;
  &:hover {
    background-color: var(--xx-fill-color);
  }
}
</style>