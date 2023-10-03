<template>
  <div id="qy-translator__id">
    <div class="tool-trans-main">
      <TransTopBar />
      <div class="transHook-main" @mouseup.stop="up">
        <Editor v-if="baseHook.status === 'editing'" />
        <TransResult v-if="baseHook.isResultInit" />
      </div>
    </div>
    <TransDialog />
    <TransToast />
  </div>
</template>

<script setup lang="ts">
import {
  inject,
} from "vue";
import Editor from "./Editor.vue"
import TransResult from "./TransResult.vue"
import TransTopBar from "./TransTopBar.vue"
import TransDialog from "./TransDialog.vue"
import TransToast from "./TransToast.vue"
import { IBaseHook } from "@/interface/trans"

const baseHook = inject("baseHook") as IBaseHook;

function up() {
  document.onmousemove = null;
}
</script>

<style scoped lang='scss'>
::v-deep(*) {
  padding: 0;
  margin: 0;
  font-weight: normal;
  font-family: Arial, Helvetica, sans-serif;
  font-style: normal;
  line-height: normal;
  list-style: none;
  text-align: left;
}

.qy-translator__id {
  background-color: var(--xx-background-color);
}

.tool-trans-main {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: var(--xx-background-color);
  .transHook-main {
    position: relative;
    width: 100%;
    height: 100%;
  }
}
</style>

