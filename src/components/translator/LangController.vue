<template>
  <div class="controller-main" @click.stop="">
    <div v-if="baseHook.status === 'editing'" class="lang-wrap">
      <x-select
        :placeholder="choiceMsg"
        v-model="baseHook.C.fromLang"
        @change="baseHook.changeLang($event)"
        popperPosition="fixed"
      >
        <x-select-option
          v-for="(lang, key, index) in languages"
          :key="index"
          :label="lang[localeLang]"
          :value="key"
          v-show="key !== '__auto__'"
        >
        </x-select-option>
      </x-select>
      <IconBtn class="icon-btn" type="icon-fanyi" @click="baseHook.exchangeLang" />
      <x-select
        :placeholder="choiceMsg"
        v-model="baseHook.C.toLang"
        @change="baseHook.changeLang"
        popperPosition="fixed"
      >
        <x-select-option
          v-for="(lang, key, index) in languages"
          :key="index"
          :label="lang[localeLang]"
          :value="key"
          v-show="key !== 'auto'"
        >
        </x-select-option>
      </x-select>
    </div>

    <div v-else class="lang-wrap">
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
          v-show="key !== '__auto__' && key !== 'auto'"
        >
        </x-select-option>
      </x-select>
      <IconBtn type="icon-fanyi" @click="baseHook.T.options.exchange" />
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
          v-show="key !== '__auto__' && key !== 'auto'"
        >
        </x-select-option>
      </x-select>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconBtn from "@/components/base/IconBtn.vue";
import { inject } from "vue";
import { languages } from "@/translator/trans_base";
import { IBaseHook } from "@/interface/trans";
import { getLocaleLang } from "@/utils/share";

const baseHook = inject("baseHook") as IBaseHook;
const choiceMsg = chrome.i18n.getMessage("__choice__");
const localeLang = getLocaleLang() as any;
</script>


<style lang="scss" scoped>
.controller-main {
  box-sizing: border-box;
  position: relative;
  width: 100%;
  height: 30px;
  padding: 0 8px 0 8px;
  margin-bottom: 5px;
  .lang-wrap {
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--xx-fill-color-deep);
    border-radius: 5px;
    height: 30px;
    ::v-deep(.icon-btn-main) {
      background-color: var(--xx-fill-color-deep)
    }
    ::v-deep(.xx-select__wrapper) {
      border: none !important;
      background-color: var(--xx-fill-color-deep) !important;
      height: 30px!important;
      input {
        border: none !important;
        text-align: center !important;
        height: 100% !important;
        background-color: var(--xx-fill-color-deep) !important;
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
    ::v-deep(.xx-select-input__suffix) {
      display: none !important;
    }
  }
  // border-bottom: 1px solid #ddd;
}
</style>