<template>
  <div class="popup_main">
    <Translator />
  </div>
</template>

<script>
import { defineComponent, provide, ref } from "vue";
import { translatorHook } from '../../hook/translatorHook'
import Translator from "../../components/translator/Translator.vue";

export default defineComponent({
  setup() {
    const translator = translatorHook('popup');
    translator.status = "editing"
    provide("translator", translator);
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