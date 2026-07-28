<template>
  <FloatingBall />
  <ContentTrans mode='contentInject' />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ContentTrans from "@/components/translator/ContentTrans.vue";
import FloatingBall from "./FloatingBall.vue";

export default defineComponent({
  components: {
    ContentTrans,
    FloatingBall,
  },
});
</script>