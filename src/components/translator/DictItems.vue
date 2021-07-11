<template>
  <div v-if="transHook.subTranslator.resultData?.dict">
    <div
      v-for="(item, index) in transHook.subTranslator.resultData.dict.slice(0, 8)"
      class="dict-item-box-wsrfhedsoufheqiwrhew"
      :key="index"
    >
      <div class="dict-item-pos-wsrfhedsoufheqiwrhew">{{ item.pos }}</div>
      <div class="dict-item-terms-wsrfhedsoufheqiwrhew">
        <div>{{ item.trans }}</div>
      </div>
    </div>
  </div>
  <div v-else class="no-dict-text-wsrfhedsoufheqiwrhew">
    {{ transHook.subTranslator.resultData?.text }}
  </div>
</template>

<script lang="ts">
import { defineComponent, inject } from "vue";
import {ITranslatorHook} from '@/utils/interface'

export default defineComponent({
  setup() {
    const transHook = <ITranslatorHook>inject("transHook")

    return {
      transHook,
    };
  },
});
</script>


<style scoped lang="scss">
.dict-item-box-wsrfhedsoufheqiwrhew {
  display: flex;
  padding-bottom: 14px;
  color: black;
  .dict-item-pos-wsrfhedsoufheqiwrhew {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    height: 20px;
    color: #aaa;
    font-size: 12px;
    padding-right: 8px;
  }
  .dict-item-terms-wsrfhedsoufheqiwrhew {
    font-size: 14px;
    font-weight: bold;
    word-break:break-all;
  }
}
.no-dict-text-wsrfhedsoufheqiwrhew {
  font-size: 14px;
  padding-right: 8px;
  padding-bottom: 14px;
}
</style>