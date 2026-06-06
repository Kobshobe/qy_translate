<template>
  <div class="header">
    <div class="hearder-side">
      <div class="header-title">{{geti18nMsg('title')}}</div>
      <div class="header-tab">
        <router-link to="/collections"
          ><div class="tab-item">{{geti18nMsg('__collection__')}}</div></router-link
        >
        <router-link to="/"><div class="tab-item">{{geti18nMsg('__options__')}}</div></router-link>
        
        <router-link to="/llm"><div class="tab-item">{{geti18nMsg('__llm__')}}</div></router-link>
        <router-link to="/other"
          ><div class="tab-item">{{geti18nMsg('__others__')}}</div></router-link
        >
        <router-link v-if="Mode!='public' || mode==='debug'" to="/ui_example"
          ><div class="tab-item">ui</div></router-link
        >
      </div>
    </div>

    <div class="hearder-side">
      <x-switch v-model="isDark">
        <SvgIcon v-if="isDark" type="dark-moon" :size="15" />
        <SvgIcon v-else type="light-sun" :size="14" />
      </x-switch>
    </div>
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
import {Mode} from '@/config'
import {useQyDarkWithChangeToBody} from '@/hook/use-qy-dark'
import SvgIcon from '@/components/base/SvgIcon.vue'

document.title = geti18nMsg('title')
const baseHook = optionBaseHook() as IOptionBaseHook;
provide("baseHook", baseHook);

const {isDark} = useQyDarkWithChangeToBody()

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
      color: #6e6d7a;
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