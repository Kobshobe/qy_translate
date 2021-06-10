<template>
  <div class="result-main">
    <div v-if="phrase.result !== undefined">
      <div>{{phrase.explain}}</div>
    </div>
  </div>
</template>

<script lang="ts">
  import {defineComponent, inject} from 'vue';

  // interface IResult {
  //   alternative_translations: Object
  //   confidence: number
  //   dict: Object
  //   ld_result: any
  //   query_inflections: any
  //   sentences: any
  //   src: any
  // }

  export default defineComponent({
    setup() {
      const phrase = inject("phrase")

      return {
        phrase
      }
    }
  })

</script>

<style scoped>
  .result-main {
    width: 100%;
    min-height: 200px;
    font-size: 18px;
    padding: 30px;
  }
</style>