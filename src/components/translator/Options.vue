<template>
  <div class="inner-options-main-wsrfhedsoufheqiwrhew" @click="translator.options.close">
    <div class="option-content-wsrfhedsoufheqiwrhew" @click.stop="">
      <el-select
        placeholder="请选择"
        :filterable="translator.mode !== 'popup'"
        v-model="translator.options.from"
        :popperAppendToBody="true"
        @visibleChange="popupVisibleChange($event, 'fromLangPopup-wsrfhedsoufheqiwrhew')"
        popperClass="fromLangPopup-wsrfhedsoufheqiwrhew"
        @change="translator.options.close"
      >
        <el-option
          v-for="(lang, key, index) in languages"
          :key="index"
          :label="lang['zh-CN']"
          :value="key"
        >
        </el-option>
      </el-select>
      <IconBtn type="icon-fanyi" :rotate="90" @click="translator.options.exchange" />
      <el-select
        placeholder="请选择"
        :filterable="translator.mode !== 'popup'"
        v-model="translator.options.to"
        :popperAppendToBody="true"
        @visibleChange="popupVisibleChange($event, 'toLangPopup-wsrfhedsoufheqiwrhew')"
        popperClass="toLangPopup-wsrfhedsoufheqiwrhew"
        @change="translator.options.close"
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

      <!-- 翻译源 -->
      <div style="height: 1px; width: 100%; background-color: #e4e7ed" @click.stop=""></div>
      <el-select
        placeholder="请选择"
        :filterable="false"
        v-model="translator.options.engine"
        :popperAppendToBody="true"
        @visibleChange="popupVisibleChange($event, 'enginePopup-wsrfhedsoufheqiwrhew')"
        popperClass="enginePopup-wsrfhedsoufheqiwrhew"
        @change="translator.options.changeEngine"
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
      <div style="height: 1px; width: 100%; background-color: #e4e7ed"></div>
      <div class="more-option-wsrfhedsoufheqiwrhew" @click="translator.options.openOptionsPage">{{moreMsg}}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, inject, watchEffect, Ref } from "vue";
import IconBtn from "../base/IconBtn.vue";
import { languages, engines } from "@/translator/language";
import {ITranslatorHook} from '@/utils/interface';

export default defineComponent({
  setup() {
    const translator = <ITranslatorHook>inject("translator");

    function popupVisibleChange(event: boolean, className: string) {
      if (translator.mode!== "popup") return;
      if (!event) return;
      // @ts-ignore
      const popupList: HTMLElement[] = document.getElementsByClassName(
        "el-select__popper " + className
      );
      popupList.forEach((element) => {
        setTimeout(() => {
          element.setAttribute(
            "style",
            "position:absolute;right:150px;bottom:10px;z-index:22222222;"
          );
          //@ts-ignore
          const arrows: HTMLElement[] = element.getElementsByClassName(
            "el-popper__arrow"
          );
          arrows.forEach((elm) => {
            elm.setAttribute("style", "display:none;");
          })
        })
      })
    }

    const moreMsg = chrome.i18n.getMessage("moreOption")

    return {
      languages,
      engines,
      translator,
      popupVisibleChange,
      moreMsg
    };
  },
  components: {
    IconBtn,
  },
});
</script>


<style scoped lang="scss">
@import "../../app.scss";

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
    padding: 8px;
    background-color: white;
    border-radius: 8px;
    border: $normalBorder;
    box-shadow: $normalBoxShadow;
    .more-option-wsrfhedsoufheqiwrhew {
      padding-top: 7px;
      cursor: pointer;
      font-size: 14px;
      color: #555;
    }
    ::v-deep(.el-input__inner) {
      border: none;
      padding: 0 8px;
      text-align: center;
      color: $mainColor;
      font-weight: bold;
      box-shadow: none;
      background-color: white;
    }
    ::v-deep(.el-popper__arrow) {
      display: none;
    }
    ::v-deep(.el-input__suffix) {
      display: none;
    }
    ::v-deep(.el-select) {
      width: 100%
    }
  }
}
</style>