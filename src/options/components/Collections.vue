<template>
  <CollSide />
  <div class="main">
    <div class="phrase-list">
      <PhraseItem
        v-for="(item, index) of hook.coll.phraseList"
        :phraseInfo="item"
        :index="index"
        :key="index"
      />
      <LoadStatus />
    </div>
    <CollFooter />
    <ContentTrans mode="option" />
  </div>
</template>

<script lang="ts">
import { defineComponent, inject } from "vue";
import PhraseItem from "@/options/components/PhraseItem.vue";
import CollFooter from "@/options/components/CollFooter.vue";
import CollSide from "@/options/components/CollSide.vue";
import LoadStatus from "@/options/components/LoadStatus.vue";
import ContentTrans from '@/components/translator/ContentTrans.vue'
import {IOptionBaseHook} from '@/interface/options'

export default defineComponent({
  setup() {
    const hook = <IOptionBaseHook>inject('baseHook')
    hook.coll.initColl()
    return {
      hook,
    };
  },
  components: {
    PhraseItem,
    CollFooter,
    CollSide,
    LoadStatus,
    ContentTrans,
  },
});
</script>


<style lang="scss" scoped>
@import "@/app.scss";

.main {
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  height: 100%;
  width: 100%;
  overflow: hidden;
  .phrase-list {
    box-sizing: border-box;
    height: 100%;
    padding-bottom: 100px;
    overflow: auto;
  }
}
</style>