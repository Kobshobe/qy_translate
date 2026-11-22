<template>
  <div class="header">
    <div class="hearder-side">
      <div class="header-title">{{geti18nMsg('title')}}</div>
      <div class="header-tab">
        <router-link to="/collections"
          ><div class="tab-item">{{geti18nMsg('__collection__')}}</div></router-link
        >
        <router-link to="/settings/trans" :class="{'router-link-active': $route.path.startsWith('/settings')}"><div class="tab-item">{{geti18nMsg('__options__')}}</div></router-link>
        <router-link to="/llm"><div class="tab-item">{{geti18nMsg('__llm__')}}</div></router-link>
        <router-link to="/other"
          ><div class="tab-item">{{geti18nMsg('__others__')}}</div></router-link
        >
        <router-link v-if="Mode!='public' || mode==='debug' || platform==='debug'" to="/ui_example"
          ><div class="tab-item">UI</div></router-link
        >
        <router-link v-if="Mode!='public' || mode==='debug' || platform==='debug'" to="/rule-lab"
          ><div class="tab-item">RULE-LAB</div></router-link
        >
      </div>
    </div>

    <x-theme-switch :model-value="themeMode" :system-dark="systemDark"
      @update:model-value="setMode" />
  </div>
  <div class="content">
    <router-view></router-view>
  </div>

</template>

<script setup lang="ts">
import { provide } from "vue";
import { optionBaseHook } from "@/hook/optionPageHook";

import {geti18nMsg} from '@/utils/share';
import {IOptionBaseHook} from '@/interface/options';
import {Mode, platform} from '@/config'
import {useQyDarkWithChangeToBody} from '@/hook/use-qy-dark'
import {useDark} from '@/xxuse/useDark'

document.title = geti18nMsg('title')
const baseHook = optionBaseHook() as IOptionBaseHook;
provide("baseHook", baseHook);

const {mode: themeMode, setMode} = useQyDarkWithChangeToBody()
// in auto mode isDark reflects the system preference; only used for the auto tooltip
const {isDark: systemDark} = useDark()

const mode = new URLSearchParams(window.location.search).get('mode')
</script>


<style scoped lang="scss">
a {
  text-decoration: none;
}

.header {
  box-sizing: border-box;
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
  border-bottom: 1px solid var(--xx-border-color);
  z-index: 100;
  padding: 0 20px 0 20px;
  background-color: var(--xx-background-color);
  .hearder-side {
    display: flex;
  }
  .header-title {
    font-size: 20px;
    padding-right: 20px;
    color: var(--xx-text-color-regular);
  }
  .header-tab {
    display: flex;
    .tab-item {
      padding: 3px 20px 0 20px;
      font-size: 15px;
      color: var(--xx-text-color-regular);
      font-weight: bold;
      cursor: pointer;
      transition: color 0.2s;
    }
    .tab-item:hover {
      color: $mainColor;
    }
    .router-link-active .tab-item {
      color: $mainColor;
    }
  }
}

.content {
  box-sizing: border-box;
  display: flex;
  padding-top: 70px;
  height: 100vh;
}
</style>