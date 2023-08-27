<template>
  <div class="side">
    <div class="coll-list">
      <CollItem
        v-for="(item, index) of hook.coll.collList"
        :collInfo="item"
        :key="index"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject } from "vue";
import CollItem from "@/options/components/CollItem.vue";

export default defineComponent({
  setup() {
    const hook = inject("baseHook");

    return { hook };
  },
  components: {
    CollItem
  },
});
</script>


<style lang="scss" scoped>
.side {
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  border-right: 1px solid #efefef;
  height: 100%;
  width: 270px;
  overflow: hidden;
  padding-left: 20px;
  flex-shrink: 0;
  .coll-list {
    height: 100%;
    overflow: auto;
  }
  .coll-left-footer {
    position: absolute;
    bottom: 10px;
    left: 10px;
  }
}
</style>