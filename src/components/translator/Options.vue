<template>
  <div
    class="inner-options-main-wsrfhedsoufheqiwrhew"
    @click="baseHook.T.options.close"
  >
    <div class="option-content-wsrfhedsoufheqiwrhew" @click.stop="">
      <el-select
        :placeholder="choiceMsg"
        filterable
        v-model="baseHook.T.options.from"
        :popperAppendToBody="baseHook.mode === 'popup' ? true : false"
        popperClass="fromLangPopup-wsrfhedsoufheqiwrhew"
        @change="baseHook.T.options.close"
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
      <IconBtn
        type="icon-fanyi"
        :rotate="90"
        @click="baseHook.T.options.exchange"
      />
      <el-select
        :placeholder="choiceMsg"
        filterable
        v-model="baseHook.T.options.to"
        :popperAppendToBody="baseHook.mode === 'popup' ? true : false"
        popperClass="toLangPopup-wsrfhedsoufheqiwrhew"
        @change="baseHook.T.options.close"
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

      <!-- 翻译源 -->
      <div
        style="height: 1px; width: 100%; background-color: #e4e7ed"
        @click.stop=""
      ></div>
      <el-select
        :placeholder="choiceMsg"
        filterable
        v-model="baseHook.T.options.engine"
        :popperAppendToBody="baseHook.mode === 'popup' ? true : false"
        popperClass="enginePopup-wsrfhedsoufheqiwrhew"
        @change="baseHook.T.options.changeEngine"
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
      <div style="height: 1px; width: 100%; background-color: #e4e7ed"></div>
      <div
        class="more-option-wsrfhedsoufheqiwrhew"
        @click="baseHook.T.options.openOptionsPage"
      >
        {{ moreMsg }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject} from "vue";
import IconBtn from "../base/IconBtn.vue";
import { languages, engines } from "@/translator/language";
import { IBaseHook } from "@/interface/trans";
import { getLocaleLang, geti18nMsg } from "@/utils/share";

export default defineComponent({
  setup() {
    const baseHook = inject("baseHook") as IBaseHook;
    const choiceMsg = chrome.i18n.getMessage("__choice__");
    const localeLang = getLocaleLang();



    const moreMsg = chrome.i18n.getMessage("moreOption");

    return {
      languages,
      engines,
      baseHook,
      moreMsg,
      choiceMsg,
      localeLang,
      geti18nMsg,
    };
  },
  components: {
    IconBtn,
  },
});
</script>


<style scoped lang="scss">
// @import "@/app.scss";

.inner-options-main-wsrfhedsoufheqiwrhew {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  border-radius: 8px;
  .option-content-wsrfhedsoufheqiwrhew {
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
    background-color: white; //dark
    border-radius: 8px;
    border: $normalBorder;
    box-shadow: $normalBoxShadow;
    .more-option-wsrfhedsoufheqiwrhew {
      margin-top: 7px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      font-size: 14px;
      color: #555;
      height: 20px;
    }
    ::v-deep(.el-input__wrapper) {
      padding: 0;
    }
    ::v-deep(.el-input__inner) {
      height: 50px;
    }
    ::v-deep(.el-select-dropdown__item) {
      list-style: none;
    }
    ::v-deep(.el-input) {
      padding: 8px 0 !important;
      input {
        border: none !important;
        text-align: center !important;
        height: 100% !important;
        background-color: white !important;
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
    ::v-deep(.el-popper__arrow) {
      display: none;
    }
    ::v-deep(.el-input__suffix) {
      display: none;
    }
    ::v-deep(.el-select) {
      width: 100%;
    }
  }
}
</style>