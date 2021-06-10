<template>
  <div class="option-item-main">
    <div class="option-item-title">{{title}}</div>
    <slot></slot>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
    props: {
        title: String
    }
})
</script>


<style scoped lang='scss'>
.option-item-main {
  padding-bottom: 40px;
  .option-item-title {
    font-size: 15px;
    font-weight: bold;
    padding-bottom: 40px;
  }
}
</style>