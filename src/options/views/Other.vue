<template>
  <div class="other-container">
    <div class="other-item-wrap">
      <div class="other-item-text" @click="toInstructions">
        {{ geti18nMsg("__instructions__") }}
      </div>
      <div style="width: 15px"></div>
      <div class="other-item-text" @click="toPDFReader">
        {{ geti18nMsg("PDFViewer") }}
      </div>
      <div style="width: 15px"></div>
      <div class="other-item-text" @click="toGitHub">GitHub</div>
      <div style="width: 15px"></div>
      <a class="other-item-text" href="mailto: phraseanywhere@outlook.com">{{
        geti18nMsg("contactUs")
      }}</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineComponent } from "vue";
import { geti18nMsg } from "@/utils/share";
import { eventToGoogle } from "@/utils/analytics";
import { openPDFReader } from "@/utils/chromeApi";

function toGitHub() {
  window.open(`https://github.com/Kobshobe/qy_translate`);
  eventToGoogle({
    name: "toGitHub",
    params: {
      locale: chrome.i18n.getMessage("@@ui_locale"),
    },
  });
}

function toPDFReader() {
  openPDFReader("option");
}

function toInstructions() {
  window.open(
    `https://github.com/Kobshobe/qy_translate/blob/main/docs/Instructions/%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87).md`
  );

  eventToGoogle({
    name: "toInstructions",
    params: { locale: chrome.i18n.getMessage("@@ui_locale") },
  });
}

defineComponent({name:'other-view'})
</script>


<style lang="scss">
.other-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 70px;
  width: 100%;
  .other-item-wrap {
    display: flex;
    justify-content: center;
    width: 100%;
    .other-item-text {
      font-size: 14px;
      color: var(--xx-text-color-regular);
      cursor: pointer;
      text-decoration: none;
      padding-bottom: 20px;
      font-weight: bold;
    }
  }
}

a:link {
  color: #333;
}
</style>