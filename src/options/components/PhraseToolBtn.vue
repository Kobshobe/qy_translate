<template>
  <div>
    <IconBtn :type="icon" />
    <!-- <div class="float-sub-btn-text">{{ text }}</div> -->
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import IconBtn from "@/components/base/IconBtn.vue";

export default defineComponent({
  props: {
    icon: String,
  },
  setup() {},
  components: {
    IconBtn,
  },
});
</script>
