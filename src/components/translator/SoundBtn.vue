<template>
  <div class="btn-box">
    <div class="iframeBtn" :id="id"></div>
    <!-- <SvgIcon type="icon-shengyin-copy" :size="15" /> -->
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, inject } from "vue";
import {IBaseHook} from '@/interface/trans'
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
    theIframe.setAttribute("allowtransparency", "true")
    theIframe.setAttribute("style", "color-scheme:light;background-color:transparent;")
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
    // SvgIcon,
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
iframe {
  background-color: transparent;
  color-scheme: light;
}
.btn-box {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 26px;
  width: 26px;
  cursor: pointer;
}

.iframeBtn {
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
</style>