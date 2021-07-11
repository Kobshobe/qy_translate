<template>
  <div class="option-bottom">
    <div class="bottom-text" @click="toIndex">{{sNameMsg}}</div>
    <div style="width: 10px"></div>
    <div class="bottom-text" @click="toPDFReader" title="在图标右键菜单处也可以打开哦">{{PDFViewerMsg}}</div>
    <div style="width: 10px"></div>
    <div class="bottom-text" @click="toStore">{{appStoreMsg}}</div>
    <div style="width: 10px"></div>
    <div class="bottom-text" @click="toGitHub">GitHub</div>
    <div style="width: 10px"></div>
    <a class="bottom-text" href="mailto: phraseanywhere@outlook.com">{{contactUsMsg}}</a>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ElMessage } from "element-plus";
import { storeUrl, client } from "../../config";
import { eventToGoogle } from "../../utils/analytics";
import {openPDFReader} from '@/utils/chromeApi'

export default defineComponent({
  setup() {
    function toStore() {
      window.open(`${storeUrl}?c=${client.c}&cv=${client.cv}`);
      eventToGoogle({
        name: "toStore",
        params: {
          locale: chrome.i18n.getMessage("@@ui_locale")
        },
      });
    }

    function toGitHub() {
      window.open(`https://github.com/Kobshobe/qy_translate`);
      eventToGoogle({
        name: "toGitHub",
        params: {
          locale: chrome.i18n.getMessage("@@ui_locale")
        },
      });
    }

    function toIndex() {
      window.open(`https://www.fishfit.fun:8080/p/web/home/option?c=${client.c}&cv=${client.cv}`);

      eventToGoogle({
        name: "optionToIndex",
        params: {locale: chrome.i18n.getMessage("@@ui_locale")},
      });
    }

    function toPDFReader() {
      openPDFReader("option")
    }

    const PDFViewerMsg = chrome.i18n.getMessage("PDFViewer")
    const appStoreMsg = chrome.i18n.getMessage("appStore")
    const sNameMsg = chrome.i18n.getMessage("sName")
    const contactUsMsg = chrome.i18n.getMessage("contactUs")


    return {
      toStore,
      toIndex,
      toGitHub,
      toPDFReader,
      PDFViewerMsg,
      appStoreMsg,
      sNameMsg,
      contactUsMsg,
    };
  },
});
</script>


<style lang="scss" scoped>
.option-bottom {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 25px;
  border-top: 1px solid #dadada;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #777;
  font-size: 15px;
  background-color: white;
  .bottom-text {
    text-decoration: underline;
    cursor: pointer;
  }
  a:link {
    color: #777;
  }
}
</style>