<template>
  <ContentTrans mode="pdf" />
  <el-dialog
    title="打开网络PDF文件"
    v-model="dialogVisible"
    width="500px"
  >
    <el-input
      v-model="input"
      :placeholder="enterLinkMsg"
      size="medium"
    ></el-input>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="openLinkPDF">确 定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import ContentTrans from "../components/translator/ContentTrans.vue";
import { openPDFReader } from "@/utils/chromeApi";

export default defineComponent({
  setup() {
    const dialogVisible = ref(false);
    const input = ref("");

    const b = <HTMLLIElement>document.getElementById("open-link");
    b.addEventListener("click", () => {
      dialogVisible.value = true;
    });

    function openLinkPDF() {
      if (input.value.length > 4) {
        openPDFReader("openLink", input.value);
      }
    }

    const enterLinkMsg = chrome.i18n.getMessage('__enterLink__')

    return {
      dialogVisible,
      input,
      openLinkPDF,
      enterLinkMsg
    };
  },
  components: {
    ContentTrans,
  },
});
</script>
