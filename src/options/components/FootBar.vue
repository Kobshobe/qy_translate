<template>
  <div class="option-bottom">
    <div class="bottom-text" @click="toPDFReader" title="在图标右键菜单处也可以打开哦">PDF阅读器</div>
    <div style="width: 10px"></div>
    <div class="bottom-text" @click="toStore">应用市场</div>
    <div style="width: 10px"></div>
    <div class="bottom-text" @click="copyShareUrl">分享链接</div>
    <div style="width: 10px"></div>
    <div class="bottom-text" @click="toGitHub">GitHub</div>
    <div style="width: 10px"></div>
    <a class="bottom-text" href="mailto: phraseanywhere@outlook.com">联系我们</a>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ElMessage } from "element-plus";
import { storeUrl, client, clientVersion } from "../../config";
import { eventToGoogle } from "../../utils/analytics";
import {openPDFReader} from '@/utils/chromeApi'

export default defineComponent({
  setup() {
    function toStore() {
      window.open(`${storeUrl}?c=${client}&cv=${clientVersion}`);
      eventToGoogle({
        name: "toStore",
        params: {},
      });
    }

    function toGitHub() {
      window.open(`https://github.com/Kobshobe/qy_translate`);
      eventToGoogle({
        name: "toGitHub",
        params: {},
      });
    }

    function copyShareUrl() {
      const tempInput = document.createElement("input");
      tempInput.value = `${storeUrl}_share?c=${client}&cv=${clientVersion}`;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      document.body.removeChild(tempInput);
      ElMessage.success({
        message: "分享链接已复制",
        type: "success",
      });
      eventToGoogle({
        name: "copyShareLink",
        params: {},
      });
    }

    function toPDFReader() {
      openPDFReader("option")
    }

    return {
      toStore,
      copyShareUrl,
      toGitHub,
      toPDFReader
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
  color: #aaa;
  font-size: 15px;
  .bottom-text {
    text-decoration: underline;
    cursor: pointer;
  }
  a:link {
    color: #aaa;
  }
}
</style>