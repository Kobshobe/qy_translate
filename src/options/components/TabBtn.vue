<template>
  <div class="tab-btn-main" @click="$emit('selectTab', index)">
    <div :class="active ? 'tab-btn-text tab-btn-active-text' : 'tab-btn-text'">
      {{ text }}
    </div>

    <div
      :class="active ? 'tab-is-active tab-active-line' : 'tab-active-line'"
    ></div>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    text: String,
    active: {
      type: Boolean,
      default: true,
    },
    index: {
      require: true,
      type: Number,
    },
  },
  emits: ["selectTab"],
});
</script>


<style scoped lang="scss">
@import "../../app.scss";

.tab-btn-main {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  width: 230px;
  height: 100%;
  cursor: pointer;
  .tab-btn-text {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    font-size: 15px;
    font-weight: bold;
  }
  .tab-btn-active-text {
      color: $mainColor;
  }
  .tab-active-line {
    width: 100%;
    height: 5px;
  }
  .tab-is-active {
    background-color: $mainColor;
  }
}
</style>