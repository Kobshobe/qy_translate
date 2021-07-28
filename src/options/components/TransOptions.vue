<template>
  <div class="option-container">
    <OptionItem :title="`${geti18nMsg('__defaultTransEngine__')}:`">
      <el-select
        v-model="hook.OP.conf.C.transEngine"
        :placeholder="geti18nMsg('__choice__')"
        @change="hook.OP.conf.changeTransEngine"
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
    <OptionItem :title="`${geti18nMsg('__interface__')}:`">
      <el-radio
        v-model="hook.OP.conf.C.mode"
        label="simple"
        @change="hook.OP.conf.changeMode"
        >{{ geti18nMsg("__simpleAndIntellgent__") }}</el-radio
      >
      <el-radio
        v-model="hook.OP.conf.C.mode"
        label="profession"
        @change="hook.OP.conf.changeMode"
        >{{ geti18nMsg("__profession__") }}</el-radio
      >
    </OptionItem>
    <OptionItem :title="`${geti18nMsg('__defaultLang__')}:`">
      <div class="two-lang-wrap">
        <div class="lang-box">
          <div class="lang-title">{{ geti18nMsg("mainLang") }}</div>
          <el-select
            v-model="hook.OP.conf.C.mainLang"
            :placeholder="geti18nMsg('__choice__')"
            @change="hook.OP.conf.changeMainLang"
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
        </div>
        <div class="lang-box">
          <div class="lang-title">{{ geti18nMsg("secondLang") }}</div>
          <el-select
            v-model="hook.OP.conf.C.secondLang"
            :placeholder="geti18nMsg('__choice__')"
            @change="hook.OP.conf.changeSecondLang"
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
        </div>
      </div>
    </OptionItem>
    <OptionItem :title="`${geti18nMsg('__transMethods__')}:`">
      <el-checkbox
        v-model="hook.OP.conf.C.isTreadWord"
        @change="hook.OP.conf.changeTreadWord"
        >{{ geti18nMsg("treadWord") }}</el-checkbox
      >
      <el-checkbox
        v-model="hook.OP.conf.C.menuTrans"
        @change="hook.OP.conf.changeMenuTrans"
        >{{ geti18nMsg("__menuTrans__") }}</el-checkbox
      >
    </OptionItem>
    <OptionItem :title="`${geti18nMsg('__enterTrans__')}:`">
      <el-radio
        v-model="hook.OP.conf.C.keyDownTrans"
        label="Enter"
        @change="hook.OP.conf.changeKeyDownTrans"
        >Enter</el-radio
      >
      <el-radio
        v-model="hook.OP.conf.C.keyDownTrans"
        label="Shift+Enter"
        @change="hook.OP.conf.changeKeyDownTrans"
        >Shift+Enter</el-radio
      >
    </OptionItem>
    <OptionItem :title="`${geti18nMsg('__transItemDisplay__')}:`">
      <el-checkbox
        v-model="hook.OP.conf.C.showProun"
        @change="hook.OP.conf.changeShowProun"
        >{{ geti18nMsg("__showProun__") }}</el-checkbox
      >
    </OptionItem>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, inject } from "vue";
import OptionItem from "./OptionItem.vue";
import { languages, engines } from "@/translator/language";
import { platform } from "@/config";
import { IOptionBaseHook } from "@/interface/options";
import { getLocaleLang, geti18nMsg } from "@/utils/share";

export default defineComponent({
  setup() {
    const hook = <IOptionBaseHook>inject("baseHook");
    const localeLang = getLocaleLang();

    return {
      hook,
      languages,
      engines,
      localeLang,
      geti18nMsg,
    };
  },
  components: {
    OptionItem,
  },
});
</script>


<style scoped lang='scss'>
.option-container {
  box-sizing: border-box;
  width: 100%;
  padding: 70px 0 150px 100px;
  overflow: scroll;
}

.colume-option {
  display: flex;
  flex-wrap: nowrap;
}
.to-min-qr {
  height: 100px;
  width: 100px;
}

.two-lang-wrap {
  display: flex;
  .lang-box {
    width: 250px;
    .lang-title {
      padding-bottom: 20px;
      color: #666;
      font-size: 14px;
    }
  }
}
</style>