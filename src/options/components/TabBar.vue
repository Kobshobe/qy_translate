<template>
  <div class="tab-main">
    <TabBtn
      v-for="(text, index) of optionPageHook.tabsInfo"
      :text="text"
      :active="optionPageHook.activeTabIndex === index"
      :index="index"
      :key="index"
      @selectTab="optionPageHook.selectTab"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, inject } from "vue";
import TabBtn from "./TabBtn.vue";
import {eventToGoogle} from '@/utils/analytics'

export default defineComponent({
  setup() {

    const optionPageHook = inject('optionPageHook')

    return {
      optionPageHook,
    };
  },
  components: {
    TabBtn,
  },
});
</script>


<style scoped lang="scss">
.tab-main {
  display: flex;
  flex-wrap: nowrap;
  height: 53px;
  width: 100%;
  border-bottom: 1px solid #d7d7d7;
}
</style>