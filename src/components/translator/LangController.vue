<template>
  <div class="controller-main" @click.stop="">
    <div v-if="baseHook.status === 'editing'" class="lang-wrap">
      <el-select
        :placeholder="choiceMsg"
        v-model="baseHook.C.fromLang"
        :popperAppendToBody="baseHook.mode === 'popup' ? true : false"
        filterable
        @change="baseHook.changeLang($event)"
        popperClass="popup-wsrfhedsoufheqiwrhew"
      >
        <el-option
          v-for="(lang, key, index) in languages"
          :key="index"
          :label="lang[localeLang]"
          :value="key"
          v-show="key !== '__auto__'"
        >
        </el-option>
      </el-select>
      <IconBtn type="icon-fanyi" @click="baseHook.exchangeLang" />
      <el-select
        :placeholder="choiceMsg"
        filterable
        v-model="baseHook.C.toLang"
        :popperAppendToBody="baseHook.mode === 'popup' ? true : false"
        @change="baseHook.changeLang"
        popperClass="popup-wsrfhedsoufheqiwrhew"
      >
        <el-option
          v-for="(lang, key, index) in languages"
          :key="index"
          :label="lang[localeLang]"
          :value="key"
          v-show="key !== 'auto'"
        >
        </el-option>
      </el-select>
    </div>

    <div v-else class="lang-wrap">
      <el-select
        :placeholder="choiceMsg"
        v-model="baseHook.T.options.from"
        filterable
        :popperAppendToBody="baseHook.mode === 'popup' ? true : false"
        @change="baseHook.T.options.close"
        popperClass="popup-wsrfhedsoufheqiwrhew"
      >
        <el-option
          v-for="(lang, key, index) in languages"
          :key="index"
          :label="lang[localeLang]"
          :value="key"
          v-show="key !== '__auto__' && key !== 'auto'"
        >
        </el-option>
      </el-select>
      <IconBtn type="icon-fanyi" @click="baseHook.T.options.exchange" />
      <el-select
        :placeholder="choiceMsg"
        filterable
        v-model="baseHook.T.options.to"
        :popperAppendToBody="baseHook.mode === 'popup' ? true : false"
        @change="baseHook.T.options.close"
        popperClass="popup-wsrfhedsoufheqiwrhew"
      >
        <el-option
          v-for="(lang, key, index) in languages"
          :key="index"
          :label="lang[localeLang]"
          :value="key"
          v-show="key !== '__auto__' && key !== 'auto'"
        >
        </el-option>
      </el-select>
    </div>
  </div>
</template>

<script lang="ts">
import IconBtn from "@/components/base/IconBtn.vue";
import { defineComponent, inject, watchEffect } from "vue";
import { languages } from "@/translator/language";
import { baseTransHook } from "@/hook/translatorHook";
import { IBaseHook } from "@/interface/trans";
import { getLocaleLang } from "@/utils/share";

export default defineComponent({
  setup() {
    const baseHook = inject("baseHook") as IBaseHook;
    const choiceMsg = chrome.i18n.getMessage("__choice__");
    const localeLang = getLocaleLang();

    return {
      baseHook,
      languages,
      choiceMsg,
      localeLang,
    };
  },
  components: {
    IconBtn,
  },
});
</script>


<style lang="scss" scoped>
@import "@/app.scss";
.controller-main {
  box-sizing: border-box;
  position: relative;
  width: 100%;
  height: 30px;
  padding: 0 8px 0 8px;
  margin-bottom: 5px;
  .lang-wrap {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #efefef;
    border-radius: 5px;
    height: 100%;
    ::v-deep(.el-input__wrapper) {
      padding: 0;
    }
    ::v-deep(.el-input) {
      input {
        border: none !important;
        text-align: center !important;
        height: 100% !important;
        background-color: #efefef !important;
        color: $mainColor !important;
        font-weight: bold !important;
        padding: 0 !important;
        margin: 0 !important;
        box-shadow: none !important;
      }
      input:focus {
        border: none;
        text-align: center;
        box-shadow: none;
        outline: none;
      }
    }
    ::v-deep(.el-input__suffix) {
      display: none !important;
    }
  }
  // border-bottom: 1px solid #ddd;
}
</style>