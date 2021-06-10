<template>
  <div class="option-main">
    <div class="option-container">
      <TabBar :tabsInfo="tabsInfo" v-model:activeIndex="activeTabIndex" />
      <div class="option-content-box">
        <TranslatorOption v-if="activeTabIndex === 0" />
        <QrLogin v-show="activeTabIndex === 1" :show="activeTabIndex === 1" />
        <!-- <Coffee v-if="activeTabIndex === 2" /> -->
      </div>
    </div>
    <FootBar />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import QrLogin from "./QrLogin.vue";
import TabBar from "./TabBar.vue";
import FootBar from './FootBar.vue'
import TranslatorOption from "./TranslatorOption.vue";
import { getOptionOpenParmas } from "@/utils/chromeApi";

export default defineComponent({
  setup() {
    const tabsInfo = ["翻译设置", "微信登录"];
    const activeTabIndex = ref(0);

    getOpenParams();

    async function getOpenParams() {
      const openParams = await getOptionOpenParmas();
      if (openParams && openParams.tab === "login") {
        activeTabIndex.value = 1;
      }
    }

    return {
      tabsInfo,
      activeTabIndex
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
  min-height: 530px;
  /* border-radius: 10px; */
  background-color: white;
}

.option-content-box {
  box-sizing: border-box;
  height: 100%;
  width: 100%;
  padding: 50px 85px 50px 85px;
}
</style>