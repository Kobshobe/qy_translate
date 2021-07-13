<template>
  <div class="colume-option">
    <OptionItem :title="`${defaultTransEngineMsg}:`">
      <el-select
        v-model="hook.conf.C.transEngine"
        :placeholder="choiceMsg"
        @change="hook.conf.changeTransEngine"
        :filterable="false"
        size="medium"
      >
        <el-option-group
          v-for="group in engines"
          :key="group.code"
          :label="geti18nMsg(group.code)"
        >
          <el-option
            v-for="(engine, key, index) in group.engines"
            :key="index"
            :label="geti18nMsg(engine.code)"
            :value="engine.code"
          >
          </el-option>
        </el-option-group>
      </el-select>
    </OptionItem>
    <OptionItem :title="`${interfaceMsg}:`">
      <el-radio
        v-model="hook.conf.C.mode"
        label="simple"
        @change="hook.conf.changeMode"
        >{{simpleAndIntellgentMsg}}</el-radio
      >
      <el-radio
        v-model="hook.conf.C.mode"
        label="profession"
        @change="hook.conf.changeMode"
        >{{professionMsg}}</el-radio
      >
    </OptionItem>
  </div>

  <div class="colume-option">
    <OptionItem :title="mainLangMsg">
      <el-select
        v-model="hook.conf.C.mainLang"
        :placeholder="choiceMsg"
        @change="hook.conf.changeMainLang"
        filterable
        size="medium"
      >
        <el-option
          v-for="(lang, key, index) in languages"
          :key="index"
          :label="lang[localeLang]"
          :value="key"
          v-show="key !== 'auto' && key !== '__auto__'"
        >
        </el-option>
      </el-select>
    </OptionItem>
    <OptionItem :title="secondLangMsg">
      <el-select
        v-model="hook.conf.C.secondLang"
        :placeholder="choiceMsg"
        @change="hook.conf.changeSecondLang"
        filterable
        size="medium"
      >
        <el-option
          v-for="(lang, key, index) in languages"
          :key="index"
          :label="lang[localeLang]"
          :value="key"
          v-show="key !== 'auto' && key !== '__auto__'"
        >
        </el-option>
      </el-select>
    </OptionItem>
  </div>
  <div class="colume-option">
    <OptionItem :title="`${treadWordMsg}:`">
      <el-switch
        v-model="hook.conf.C.isTreadWord"
        active-color="#4C8BF5"
        @change="hook.conf.changeTreadWord"
      ></el-switch>
    </OptionItem>
    <OptionItem :title="`${menuTransMsg}:`">
      <el-switch
        v-model="hook.conf.C.menuTrans"
        active-color="#4C8BF5"
        @change="hook.conf.changeMenuTrans"
      ></el-switch>
    </OptionItem>
  </div>
  <div class="colume-option">
    <OptionItem :title="`${showProunMsg}:`">
      <el-switch
        v-model="hook.conf.C.showProun"
        active-color="#4C8BF5"
        @change="hook.conf.changeShowProun"
      ></el-switch>
    </OptionItem>
    <OptionItem :title="`${geti18nMsg('__enterTrans__')}:`">
      <el-radio
        v-model="hook.conf.C.keyDownTrans"
        label="Shift+Enter"
        @change="hook.conf.changeKeyDownTrans"
        >Shift+Enter</el-radio>
      <el-radio
        v-model="hook.conf.C.keyDownTrans"
        label="Enter"
        @change="hook.conf.changeKeyDownTrans"
        >Enter</el-radio>
    </OptionItem>
    <!-- <OptionItem :title="collManagerMsg">
      <div style="padding-bottom: 20px">{{ weChatCollManaMsg }}</div>
      <img class="to-min-qr" :src="qrSrc" alt="" />
    </OptionItem> -->
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, inject } from "vue";
import OptionItem from "./OptionItem.vue";
import { languages, engines } from "@/translator/language";
import { platform } from "@/config";
import { IOptionHook } from "@/utils/interface";
import {getLocaleLang, geti18nMsg} from '@/utils/share'

export default defineComponent({
  setup() {
    const hook = <IOptionHook>inject("optionPageHook");
    const localeLang = getLocaleLang()

    let qrSrc = "";
    if (platform === "edge") {
      qrSrc = "assets/images/qr_edge_option.png";
    } else {
      qrSrc = "assets/images/qr_chrome_option.png";
    }

    const treadWordMsg = chrome.i18n.getMessage("treadWord");
    const mainLangMsg = chrome.i18n.getMessage("mainLang");
    const secondLangMsg = chrome.i18n.getMessage("secondLang");
    const collManagerMsg = chrome.i18n.getMessage("collManager");
    const weChatCollManaMsg = chrome.i18n.getMessage("weChatCollMana");
    const menuTransMsg = chrome.i18n.getMessage("__menuTrans__");
    const showProunMsg = chrome.i18n.getMessage("__showProun__");
    const choiceMsg = chrome.i18n.getMessage('__choice__')
    const interfaceMsg = chrome.i18n.getMessage('__interface__')
    const defaultTransEngineMsg = chrome.i18n.getMessage('__defaultTransEngine__')
    const simpleAndIntellgentMsg = chrome.i18n.getMessage('__simpleAndIntellgent__')
    const professionMsg = chrome.i18n.getMessage('__profession__')
    // __simpleAndIntellgent__ __profession__

    return {
      hook,
      languages,
      engines,
      qrSrc,
      localeLang,
      treadWordMsg,
      mainLangMsg,
      secondLangMsg,
      collManagerMsg,
      weChatCollManaMsg,
      menuTransMsg,
      showProunMsg,
      choiceMsg,
      interfaceMsg,
      defaultTransEngineMsg,
      simpleAndIntellgentMsg,
      professionMsg,
      geti18nMsg
    };
  },
  components: {
    OptionItem,
  },
});
</script>


<style scoped lang='scss'>
.colume-option {
  display: flex;
  flex-wrap: nowrap;
}
.to-min-qr {
  height: 100px;
  width: 100px;
}
</style>