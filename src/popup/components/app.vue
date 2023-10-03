<template>
  <ThemeElement>
    <div class="popup_main">
    <Translator />
  </div>
  </ThemeElement>
  
</template>

<script lang="ts">
import { defineComponent, provide } from "vue";
import { baseTransHook } from '@/hook/translatorHook'
import Translator from "@/components/translator/Translator.vue";
import ThemeElement from "@/components/base/ThemeElement.vue";

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
.popup_main {
  width: 400px;
}
</style>