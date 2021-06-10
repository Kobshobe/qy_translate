<template>
  <div class="option-bottom">
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

    return {
      toStore,
      copyShareUrl,
      toGitHub,
    };
  },
});
</script>


<style lang="scss" scoped>
.option-bottom {
  display: flex;
  padding-top: 60px;
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