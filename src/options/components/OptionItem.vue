<template>
  <div class="option-item-main">
    <div class="title-wrap">
      <!-- <div class="title-front"></div> -->
      <div class="option-item-title">{{ title }}</div>
    </div>

    <slot></slot>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    title: String,
  },
});
</script>


<style scoped lang='scss'>
// @import '@/app.scss';

.option-item-main {
  padding-bottom: 60px;
  color: #555;
  .title-wrap {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    padding-bottom: 40px;
    .title-front {
      width: 4px;
      height: 15px;
      margin-right: 5px;
      background-color: $mainColor;
      border-radius: 2px;
    }
    .option-item-title {
      font-size: 15px;
      font-weight: bold;
      
    }
  }
}
</style>