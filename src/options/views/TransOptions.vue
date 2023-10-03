<template>
  <div class="option-container">
    <OptionItem :title="`${geti18nMsg('__defaultTransEngine__')}:`">
      <x-select
        v-model="hook.OP.conf.C.transEngine"
        :placeholder="geti18nMsg('__choice__')"
        @change="hook.OP.conf.changeTransEngine"
      >
        <x-select-group
          v-for="group in engines"
          :key="group.code"
          :label="geti18nMsg(group.code)"
        >
          <x-select-option
            v-for="(engine, _, index) in group.engines"
            :key="index"
            :label="geti18nMsg(engine.code)"
            :value="engine?.code"
          >
          </x-select-option>
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
import { defineComponent, inject } from "vue";
import OptionItem from "@/options/components/OptionItem.vue";
import { languages, engines } from "@/translator/trans_base";
import { IOptionBaseHook } from "@/interface/options";
import { getLocaleLang, geti18nMsg } from "@/utils/share";

const hook = inject("baseHook") as IOptionBaseHook;
const localeLang = getLocaleLang();
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
.to-min-qr {
  height: 100px;
  width: 100px;
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
</style>