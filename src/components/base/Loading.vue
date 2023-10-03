<template>
  <div id="qy-loading-box">
    <SvgIcon type="icon-jiazaizhong" :size=size />
  </div>
</template>

<script setup>
import SvgIcon from "./SvgIcon.vue";

const props = defineProps({
  size: {
    default: 20
  }
})
</script>


<style scoped>
.loading-box {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  background-color: var(--xx-background-color);
}

@keyframes changDeg {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

#qy-loading-box {
  background: transparent;
  animation: changDeg 1.5s linear 0.2s infinite;
}
</style>