<template>
  <OptionItem :title="`${treadWordMsg}:`">
    <el-switch v-model="optionPageHook.configInfo.isTreadWord" active-color="#4C8BF5" @change="optionPageHook.configInfo.changeTreadWord"></el-switch>
  </OptionItem>
  <div class="lang-option">
    <OptionItem :title="mainLangMsg">
      <el-select
        v-model="mainLang"
        placeholder="请选择"
        @change="changeMainLang"
        filterable
        size="medium"
      >
        <el-option
          v-for="(value, key, index) in languages"
          :key="index"
          :label="value"
          :value="key"
          v-show="key !== 'auto'"
        >
        </el-option>
      </el-select>
    </OptionItem>
    <div style="width: 150px"></div>
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
          v-for="(value, key, index) in languages"
          :key="index"
          :label="value"
          :value="key"
          v-show="key !== 'auto'"
        >
        </el-option>
      </el-select>
    </OptionItem>
  </div>

  <OptionItem :title="collManagerMsg">
    <div style="padding-bottom: 20px">{{weChatCollManaMsg}}</div>
    <img class="to-min-qr" :src="qrSrc" alt="" />
  </OptionItem>
</template>

<script lang="ts">
import { defineComponent, ref, inject } from "vue";
import OptionItem from "./OptionItem.vue";
import { languages } from "../../utils/translator";
import { setMainLang, setSecondLang, getTreadWord, setTreadWord } from "@/utils/chromeApi";
import { client } from "@/config";

export default defineComponent({
  setup() {
    const optionPageHook = inject('optionPageHook')
    const isTreadWord = ref(false)

    const mainLang = ref<string>("");
    const secondLang = ref<string>("");

    let qrSrc = "";
    if (client === "edge") {
      qrSrc = "assets/images/qr_edge_option.png";
    } else {
      qrSrc = "assets/images/qr_chrome_option.png";
    }

    const changeMainLang = (lang: string) => {
      setMainLang(lang);
    };

    const changeSecondLang = (lang: string) => {
      setSecondLang(lang);
    };

    chrome.storage.sync.get(["mainLang", "secondLang"], (result: any) => {
      if (result.mainLang) mainLang.value = result.mainLang;
      if (result.secondLang) {
        secondLang.value = result.secondLang;
      } else {
        secondLang.value = "en";
      }
    });

    const treadWordMsg = chrome.i18n.getMessage("treadWord")
    const mainLangMsg = chrome.i18n.getMessage("mainLang")
    const secondLangMsg = chrome.i18n.getMessage("secondLang")
    const collManagerMsg = chrome.i18n.getMessage("collManager")
    const weChatCollManaMsg = chrome.i18n.getMessage("weChatCollMana")

    return {
      optionPageHook,
      languages,
      mainLang,
      secondLang,
      changeMainLang,
      changeSecondLang,
      qrSrc,
      isTreadWord,
      treadWordMsg,
      mainLangMsg,
      secondLangMsg,
      collManagerMsg,
      weChatCollManaMsg
    };
  },
  components: {
    OptionItem,
  },
});
</script>


<style scoped lang='scss'>
.lang-option {
  display: flex;
  flex-wrap: nowrap;
}
.to-min-qr {
  height: 100px;
  width: 100px;
}
</style>