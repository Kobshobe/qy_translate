<template>
  <div class="tab-main">
    <TabBtn
      v-for="(text, index) of tabsInfo"
      :text="text"
      :active="activeIndex === index"
      :index="index"
      :key="index"
      @selectTab="selectTab"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import TabBtn from "./TabBtn.vue";
import {eventToGoogle} from '@/utils/analytics'

export default defineComponent({
  props: {
    tabsInfo: Array,
    activeIndex: {
      default: 0,
      type: Number,
    },
  },
  setup(props:any, context) {
    const selectTab = (index:number) => {
    //   console.log("selectTab", index);
      context.emit("update:activeIndex", index);
      eventToGoogle({
        name: 'tap_tab',
        params: {
          tabText: props.tabsInfo[index]
        }
      })
    };

    return {
      selectTab,
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