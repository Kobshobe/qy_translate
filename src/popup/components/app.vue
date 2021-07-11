<template>
  <div class="popup_main">
    <Translator />
  </div>
</template>

<script lang="ts">
import { defineComponent, provide, ref } from "vue";
import { transHook } from '@/hook/translatorHook'
import Translator from "@/components/translator/Translator.vue";

export default defineComponent({
  setup() {
    const trans = transHook('popup', 'editing');
    provide("transHook", trans);
  },
  components: {
    Translator,
  },
});
</script>

<style scoped lang="scss">
* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

.popup_main {
  width: 400px;
}
</style>