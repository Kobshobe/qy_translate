<template>
  <div>setting</div>
  <img class="qr-img" :src="b" alt="">
  <div>{{imgBuffer.res}}</div>
</template>

<script lang="ts">
  import { defineComponent, reactive, ref } from 'vue'
  import {getQR} from "../../api/api";

  export default defineComponent({
    setup() {
      const b = ref("https://www.baidu.com/img/flexible/logo/pc/result@2.png")
      const imgBuffer = reactive({
        res: {}
      })

      getQR((res) => {
        // imgBuffer.res = res
        b.value = res
      })

      return {
        b,
        imgBuffer
      }
    }
    
  })
</script>

<style scoped>
.qr-img {
  width: 100px;
  height: 100px;
}
</style>