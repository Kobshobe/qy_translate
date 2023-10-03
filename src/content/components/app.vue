<template>
  <ContentTrans mode='contentInject' />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ContentTrans from "@/components/translator/ContentTrans.vue";

export default defineComponent({
  setup() {},
  components: {
    ContentTrans,
  },
});
</script>