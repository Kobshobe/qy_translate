<template>
  <div v-if="show" class="over_layer" @click="changeShow">
    <div class="dialog-container">
      <slot></slot>
    </div>
    <div style="height: 100%"></div>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue'

  export default defineComponent({
    props: {
      show: Boolean
    },
    emits: ['update:show'],
    methods: {
      changeShow() {
        this.$emit('update:show', false)
      }
    }
  })
</script>

<style scoped>
  .over_layer {
    display: flex;
    align-items: center;
    flex-direction: column;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(50, 50, 50, 0.3);
    padding-top: 100px;
  }

  .dialog-container {
    background-color: white;
    border-radius: 5px;
  }
</style>