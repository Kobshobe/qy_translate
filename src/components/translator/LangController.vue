<template>
  <div class="controller-main" @click.stop="">
    <!-- <div class="bgxx"></div> -->
    <div class="lang-wrap">
      <el-select
        placeholder="请选择"
        :filterable="transHook.mode !== 'popup'"
        v-model="transHook.options.from"
        :popperAppendToBody="true"
        @change="transHook.options.setLang"
      >
        <el-option
          v-for="(lang, key, index) in languages"
          :key="index"
          :label="lang['zh-CN']"
          :value="key"
          v-show="key !== '__auto__'"
        >
        </el-option>
      </el-select>
      <IconBtn type="icon-fanyi" @click="transHook.options.exchange" />
      <el-select
        placeholder="请选择"
        :filterable="transHook.mode !== 'popup'"
        v-model="transHook.options.to"
        :popperAppendToBody="true"
        @change="transHook.options.setLang"
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
    </div>
  </div>
</template>

<script lang="ts">
import IconBtn from "@/components/base/IconBtn.vue";
import { defineComponent, inject } from "vue";
import { ITranslatorHook } from "@/utils/interface";
import { languages } from "@/translator/language";

export default defineComponent({
  setup() {
    const transHook = <ITranslatorHook>inject("transHook");

    return {
      transHook,
      languages,
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
  // .bgxx {
  //   position: absolute;
  //   bottom: 2px;
  //   left: 8px;
  //   right: 8px;
  //   height: 12px;
  //   background-color: #efefef;
  //   border-radius: 2px;
  // }
  .lang-wrap {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #efefef;
    border-radius: 5px;
    height: 100%;
    ::v-deep(.el-input__inner) {
      border: none;
      text-align: center;
      height: 100%;
      background-color: #efefef;
      color: $mainColor;
      font-weight: bold;
      padding: 0;
      margin: 0;
    }
  }
  // border-bottom: 1px solid #ddd;
}
</style>