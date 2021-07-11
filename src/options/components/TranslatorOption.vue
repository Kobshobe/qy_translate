<template>
  <div class="colume-option">
    <OptionItem :title="`${'默认翻译来源'}:`">
      <el-select
        v-model="hook.conf.C.transEngine"
        placeholder="请选择"
        @change="hook.conf.changeTransEngine"
        :filterable="false"
        size="medium"
      >
        <el-option-group
          v-for="group in engines"
          :key="group.name"
          :label="group.name"
        >
          <el-option
            v-for="(engine, key, index) in group.engines"
            :key="index"
            :label="engine.name"
            :value="engine.code"
          >
          </el-option>
        </el-option-group>
      </el-select>
    </OptionItem>
    <!-- mark i18n -->
    <OptionItem title="界面风格">
      <el-radio
        v-model="hook.conf.C.mode"
        label="simple"
        @change="hook.conf.changeMode"
        >简约</el-radio
      >
      <el-radio
        v-model="hook.conf.C.mode"
        label="profession"
        @change="hook.conf.changeMode"
        >专业</el-radio
      >
    </OptionItem>
  </div>

  <div class="colume-option">
    <OptionItem :title="mainLangMsg">
      <el-select
        v-model="hook.conf.C.mainLang"
        placeholder="请选择"
        @change="hook.conf.changeMainLang"
        filterable
        size="medium"
      >
        <el-option
          v-for="(lang, key, index) in languages"
          :key="index"
          :label="lang['zh-CN']"
          :value="key"
          v-show="key !== 'auto' && key !== '__auto__'"
        >
        </el-option>
      </el-select>
    </OptionItem>
    <OptionItem :title="secondLangMsg">
      <el-select
        v-model="hook.conf.C.secondLang"
        placeholder="请选择"
        @change="hook.conf.changeSecondLang"
        filterable
        size="medium"
      >
        <el-option
          v-for="(lang, key, index) in languages"
          :key="index"
          :label="lang['zh-CN']"
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

  <OptionItem :title="collManagerMsg">
    <div style="padding-bottom: 20px">{{ weChatCollManaMsg }}</div>
    <img class="to-min-qr" :src="qrSrc" alt="" />
  </OptionItem>
</template>

<script lang="ts">
import { defineComponent, ref, inject } from "vue";
import OptionItem from "./OptionItem.vue";
import { languages, engines } from "@/translator/language";
import { platform } from "@/config";
import {IOptionHook} from '@/utils/interface'

export default defineComponent({
  setup() {
    const hook = <IOptionHook>inject("optionPageHook");

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
    const menuTransMsg = chrome.i18n.getMessage("__menuTrans__")
    // const isPronunciationMsg = chrome.i18n.getMessage("isPronunciation");

    return {
      hook,
      languages,
      engines,
      qrSrc,
      treadWordMsg,
      mainLangMsg,
      secondLangMsg,
      collManagerMsg,
      weChatCollManaMsg,
      menuTransMsg
      // isPronunciationMsg
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