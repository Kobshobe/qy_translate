<template>
  <div class="popup_main">
    <Translator />
  </div>
</template>

<script lang="ts">
import { defineComponent, provide } from "vue";
import { baseTransHook } from '@/hook/translatorHook'
import Translator from "@/components/translator/Translator.vue";

export default defineComponent({
  setup() {
    const baseHook = baseTransHook('popup', 'editing')
    provide('baseHook', baseHook)
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