<template>
  <ContentTrans mode="pdf" />
  <x-dialog
    :title="geti18nMsg('__openRemotePDF__')"
    v-model="dialogVisible"
    width="500px"
  >
    <x-input
      v-model="input"
      :placeholder="enterLinkMsg"
      size="medium"
    ></x-input>
    <template #footer>
      <span class="dialog-footer">
        <x-button @click="dialogVisible = false">{{geti18nMsg('__reduce__')}}</x-button>
        <x-size-box width="15px" />
        <x-button type="primary" @click="openLinkPDF">{{geti18nMsg('__confirm__')}}</x-button>
      </span>
    </template>
  </x-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import ContentTrans from "../components/translator/ContentTrans.vue";
import { openPDFReader } from "@/utils/chromeApi";
import {geti18nMsg} from '@/utils/share'

export default defineComponent({
  setup() {
    document.title = `${geti18nMsg('title')} PDF`
    const dialogVisible = ref(false);
    const input = ref("");

    const b = document.getElementById("open-link") as HTMLLIElement;
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
      enterLinkMsg,
      geti18nMsg
    };
  },
  components: {
    ContentTrans,
  },
});
</script>

<style lang="scss" scoped>
.dialog-footer {
  display: flex;
  justify-content: end;
}
</style>
