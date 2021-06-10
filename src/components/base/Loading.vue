<template>
  <div id="my-loading-box-wsrfhedsoufheqiwrhew">
    <SvgIcon type="icon-jiazai" :size=size />
  </div>
</template>

<script>
import { defineComponent } from "vue";
import SvgIcon from "./SvgIcon.vue";

export default defineComponent({
  components: {
    SvgIcon,
  },
  props: {
    size: {
      default: 20
    }
  }
});
</script>


<style scoped>
.loading-box-wsrfhedsoufheqiwrhew {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
}

@keyframes changDeg {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

#my-loading-box-wsrfhedsoufheqiwrhew {
  animation: changDeg 1.5s linear 0.2s infinite;
}
</style>