<template>
  <div class="option-main">
    <div class="option-container">
      <TabBar />
      <div class="option-content-box">
        <TranslatorOption v-if="optionPageHook.activeTabIndex === 0" />
        <QrLogin v-show="optionPageHook.activeTabIndex === 1" :show="optionPageHook.activeTabIndex === 1" />
      </div>
    </div>
    <FootBar />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, provide } from "vue";
import hook from '@/hook/optionPageHook';
import QrLogin from "./QrLogin.vue";
import TabBar from "./TabBar.vue";
import FootBar from './FootBar.vue'
import TranslatorOption from "./TranslatorOption.vue";
import { getOptionOpenParmas } from "@/utils/chromeApi";

export default defineComponent({
  setup() {
    const optionPageHook = hook()
    provide('optionPageHook', optionPageHook)

    return {
      optionPageHook
    };
  },
  components: {
    QrLogin,
    TabBar,
    TranslatorOption,
    FootBar
  },
});
</script>


<style scoped lang="scss">
.option-main {
  display: flex;
  align-items: center;
  flex-direction: column;
  width: 100%;
  padding-top: 75px;

}

.option-container {
  width: 760px;
  /* border-radius: 10px; */
  background-color: white;
}

.option-content-box {
  box-sizing: border-box;
  min-height: 500px;
  width: 100%;
  padding: 50px 85px 50px 85px;
}
</style>