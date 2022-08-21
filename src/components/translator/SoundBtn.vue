<template>
  <div class="btn-box-wsrfhedsoufheqiwrhew">
    <SvgIcon type="icon-shengyin-copy" size="15" />
    <div class="iframeBtn-wsrfhedsoufheqiwrhew" :id="id"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, inject, watchEffect } from "vue";
import {IBaseHook} from '@/interface/trans'
import SvgIcon from "../base/SvgIcon.vue";
import { v4 } from "uuid";

export default defineComponent({
  setup(props) {
    const id = v4();

    const baseHook = inject("baseHook") as IBaseHook;

    const iframeHtmlURL = chrome.runtime.getURL("iframe.html");
    const theIframe = document.createElement("iframe") as HTMLIFrameElement;
    theIframe.setAttribute("width", "100%");
    theIframe.setAttribute("height", "100%");
    theIframe.setAttribute("src", iframeHtmlURL);
    theIframe.setAttribute("frameborder", "0");
    theIframe.setAttribute("scrolling", "no");
    //@ts-ignore
    baseHook.T[`${props.audioType}Iframe`] = theIframe;

    theIframe.addEventListener(
      "load",
      () => {
        //@ts-ignore
        theIframe.contentWindow.postMessage(
          {
            source: "phrase",
            action: "init",
            audioType: props.audioType,
            id: id,
          },
          "*"
        );
      },
      false
    );

    onMounted(() => {
      setTimeout(() => {
        const elem = document.getElementById(id)
        if (elem) {
          elem.appendChild(theIframe);
        }
      });
    });

    return {
      id,
    };
  },
  components: {
    SvgIcon,
  },
  props: {
    audioType: {
      require: true,
      type: String,
    },
  },
});
</script>


<style scoped lang="scss">
.btn-box-wsrfhedsoufheqiwrhew {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 26px;
  width: 26px;
  cursor: pointer;
}

.iframeBtn-wsrfhedsoufheqiwrhew {
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
</style>