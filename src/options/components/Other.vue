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
      <!-- <div style="width: 15px"></div>
      <div class="other-item-text" @click="showSupport">{{geti18nMsg('__fiveStar__')}}</div> -->
    </div>
    <div class="mini-program-qr">
      <img class="qr-img" :src="qrSrc" alt="" />
      <div>{{ geti18nMsg("__qyMiniProgram__") }}</div>
    </div>
  </div>
  <!-- <el-dialog width="400px" v-model="isShowSupport" :title="geti18nMsg('__supportDeveloper__')">
    <div class="support-content">
      <div class="to-store-link" @click="toStore" v-html="geti18nMsg('__giveFiveStar__')">
        
      </div>
      <div class="or">{{geti18nMsg('__or__')}}</div>
      <div class="charge" @click="toSupport">{{geti18nMsg('__giveMeCharge__')}}</div>
      <div class="both-i-want">
        <SvgIcon type="icon-fun" />
        <div style="paddingLeft:5px;">{{geti18nMsg('__IWantBoth__')}}</div>
      </div>
    </div>
  </el-dialog> -->
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { geti18nMsg } from "@/utils/share";
import { eventToGoogle } from "@/utils/analytics";
import {} from "@/config";
import { openPDFReader } from "@/utils/chromeApi";
import { platform, store, client } from "@/config";
import SvgIcon from '@/components/base/SvgIcon.vue'


export default defineComponent({
  setup() {
    function toStore() {
      window.open(store);
      eventToGoogle({
        name: "toStore_for_start",
        params: {
          locale: chrome.i18n.getMessage("@@ui_locale"),
        },
      });
    }

    const isShowSupport = ref(false);

    function showSupport() {
      isShowSupport.value = true;
      eventToGoogle({
        name: "showSupport",
        params: {
          locale: chrome.i18n.getMessage("@@ui_locale"),
        },
      });
    }

    function toSupport() {
      window.open('https://www.fishfit.fun/phrase/support.html')
      eventToGoogle({
        name: "toSupport",
        params: {
          locale: chrome.i18n.getMessage("@@ui_locale"),
        },
      });
    }

    let qrSrc = "";
    if (platform === "edge") {
      qrSrc = "assets/images/qr_edge_option.png";
    } else {
      qrSrc = "assets/images/qr_chrome_option.png";
    }

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

    return {
      geti18nMsg,
      toGitHub,
      toPDFReader,
      toInstructions,
      qrSrc,
      isShowSupport,
      showSupport,
      toStore,
      toSupport
    };
  },
  components: {
    SvgIcon
  }
});
</script>


<style lang="scss">
// @import '@/app.scss';
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
      color: #333;
      cursor: pointer;
      text-decoration: none;
      padding-bottom: 20px;
      font-weight: bold;
    }
  }

  .mini-program-qr {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    padding-top: 50px;
    font-size: 15px;
    color: #333;
    .qr-img {
      height: 130px;
      width: 130px;
      padding-bottom: 30px;
    }
  }
}

a:link {
  color: #333;
}
.support-content {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;
  flex-direction: column;
  .to-store-link {
    text-align: center;
    cursor: pointer;
    color: #333;
    span {
      color: $mainColor;
      font-weight: bold;
    }
  }
  .to-store-link:hover {
    text-decoration: underline;
  }
  .or {
    padding: 10px 0 10px 0;
  }
  .charge {
    cursor: pointer;
    color: $mainColor;
  }
  .both-i-want {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 40px;
    font-size: 12px;
    padding-bottom: 30px;
  }
}
</style>