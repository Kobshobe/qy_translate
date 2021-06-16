<template>
  <OptionItem title="划词翻译:">
    <el-switch v-model="optionPageHook.configInfo.isTreadWord" active-color="#4C8BF5" @change="optionPageHook.configInfo.changeTreadWord"></el-switch>
  </OptionItem>
  <div class="lang-option">
    <OptionItem title="我的主要语言:">
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
      title="我的第二语言:"
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

  <OptionItem title="收藏管理:">
    <div style="padding-bottom: 20px">微信扫码使用小程序管理</div>
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

    return {
      optionPageHook,
      languages,
      mainLang,
      secondLang,
      changeMainLang,
      changeSecondLang,
      qrSrc,
      isTreadWord
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