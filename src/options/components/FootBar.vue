<template>
  <div class="option-bottom">
    <div class="bottom-text" @click="toIndex">{{geti18nMsg('sName')}}</div>
    <div style="width: 10px"></div>
    <div class="bottom-text" @click="toPDFReader" title="在图标右键菜单处也可以打开哦">{{geti18nMsg('PDFViewer')}}</div>
    <div style="width: 10px"></div>
    <div class="bottom-text" @click="toStore">{{geti18nMsg('appStore')}}</div>
    <div style="width: 10px"></div>
    <div class="bottom-text" @click="toGitHub">GitHub</div>
    <div style="width: 10px"></div>
    <a class="bottom-text" href="mailto: phraseanywhere@outlook.com">{{geti18nMsg('contactUs')}}</a>
    <div style="width: 10px"></div>
    <div class="bottom-text" @click="toInstructions">{{geti18nMsg('__instructions__')}}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ElMessage } from "element-plus";
import { storeUrl, client } from "../../config";
import { eventToGoogle } from "../../utils/analytics";
import {openPDFReader} from '@/utils/chromeApi'
import {geti18nMsg} from '@/utils/share'

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

    function toInstructions() {
      window.open(`https://github.com/Kobshobe/qy_translate/blob/main/docs/Instructions/%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87).md`);

      eventToGoogle({
        name: "toInstructions",
        params: {locale: chrome.i18n.getMessage("@@ui_locale")},
      });
    }


    return {
      toStore,
      toIndex,
      toGitHub,
      toPDFReader,
      geti18nMsg,
      toInstructions
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