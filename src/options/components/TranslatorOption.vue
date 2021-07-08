<template>
  <div class="colume-option">
    <OptionItem :title="`${'默认翻译来源'}:`">
      <el-select
        v-model="transEngine"
        placeholder="请选择"
        @change="setTransEngine(transEngine)"
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
    <OptionItem :title="`${treadWordMsg}:`">
      <el-switch
        v-model="optionPageHook.configInfo.isTreadWord"
        active-color="#4C8BF5"
        @change="optionPageHook.configInfo.changeTreadWord"
      ></el-switch>
    </OptionItem>
  </div>

  <div class="colume-option">
    <OptionItem :title="mainLangMsg">
      <el-select
        v-model="mainLang"
        placeholder="请选择"
        @change="changeMainLang"
        filterable
        size="medium"
      >
        <el-option
          v-for="(lang, key, index) in languages"
          :key="index"
          :label="lang['zh-CN']"
          :value="key"
          v-show="key !== 'auto'"
        >
        </el-option>
      </el-select>
    </OptionItem>
    <OptionItem
      v-if="mainLang === 'zh-CN' || mainLang === 'zh-TW'"
      :title="secondLangMsg"
    >
      <el-select
        v-model="secondLang"
        placeholder="请选择"
        @change="changeSecondLang"
        filterable
        size="medium"
      >
        <el-option
          v-for="(lang, key, index) in languages"
          :key="index"
          :label="lang['zh-CN']"
          :value="key"
          v-show="key !== 'auto'"
        >
        </el-option>
      </el-select>
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
import {
  setMainLang,
  setSecondLang,
  getTreadWord,
  setTreadWord,
  setTransEngine,
} from "@/utils/chromeApi";
import { platform } from "@/config";

export default defineComponent({
  setup() {
    const optionPageHook = inject("optionPageHook");
    const isTreadWord = ref(false);

    const mainLang = ref<string>("");
    const secondLang = ref<string>("");
    const transEngine = ref<string>("");

    let qrSrc = "";
    if (platform === "edge") {
      qrSrc = "assets/images/qr_edge_option.png";
    } else {
      qrSrc = "assets/images/qr_chrome_option.png";
    }

    const changeMainLang = (lang: string) => {
      setMainLang(lang, "optionSet");
    };

    const changeSecondLang = (lang: string) => {
      setSecondLang(lang);
    };

    chrome.storage.sync.get(
      ["mainLang", "secondLang", "transEngine"],
      (result: any) => {
        if (result.mainLang) mainLang.value = result.mainLang;
        if (result.secondLang) {
          secondLang.value = result.secondLang;
        } else {
          secondLang.value = "en";
        }
        if (result.transEngine) {
          transEngine.value = result.transEngine;
        } else {
          transEngine.value = "ggTrans__common";
        }
      }
    );

    const treadWordMsg = chrome.i18n.getMessage("treadWord");
    const mainLangMsg = chrome.i18n.getMessage("mainLang");
    const secondLangMsg = chrome.i18n.getMessage("secondLang");
    const collManagerMsg = chrome.i18n.getMessage("collManager");
    const weChatCollManaMsg = chrome.i18n.getMessage("weChatCollMana");
    // const isPronunciationMsg = chrome.i18n.getMessage("isPronunciation");

    return {
      optionPageHook,
      languages,
      engines,
      mainLang,
      secondLang,
      transEngine,
      changeMainLang,
      changeSecondLang,
      setTransEngine,
      qrSrc,
      isTreadWord,
      treadWordMsg,
      mainLangMsg,
      secondLangMsg,
      collManagerMsg,
      weChatCollManaMsg,
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