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

    <div class="theme-slider">
      <input type="range" min="0" :max="themeModes.length - 1" step="1"
        :value="themeModes.indexOf(themeMode)" :aria-label="geti18nMsg('theme')"
        :aria-valuetext="geti18nMsg(`theme_${themeMode}`)" @input="onThemeInput" />
      <div class="theme-labels" aria-hidden="true">
        <span v-for="choice in themeModes" :key="choice" :class="{ selected: choice === themeMode }">
          {{ geti18nMsg(`theme_${choice}`) }}
        </span>
      </div>
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
import {Mode, platform} from '@/config'
import {useQyDarkWithChangeToBody} from '@/hook/use-qy-dark'
import {themeModes} from '@/xxuse/useDark'

document.title = geti18nMsg('title')
const baseHook = optionBaseHook() as IOptionBaseHook;
provide("baseHook", baseHook);

const {mode: themeMode, setMode} = useQyDarkWithChangeToBody()
function onThemeInput(event: Event) {
  setMode(themeModes[(event.target as HTMLInputElement).valueAsNumber])
}

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

.theme-slider {
  width: 9rem;
  color: var(--xx-text-color-regular);
  input {
    display: block;
    width: 100%;
    margin: 0;
    accent-color: var(--xx-c-primary);
    cursor: pointer;
  }
  .theme-labels {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    font-size: 12px;
    text-align: center;
    :first-child { text-align: start; }
    :last-child { text-align: end; }
    .selected { font-weight: bold; }
  }
}

.content {
  box-sizing: border-box;
  display: flex;
  padding-top: 70px;
  height: 100vh;
}
</style>