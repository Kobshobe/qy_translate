<template>
  <div
    v-if="!hook.coll.collItem.deleted.includes(props.collInfo.tid)"
    class="coll-item-box"
    @click="hook.coll.getPhraseList(props.collInfo.tid, 1)"
  >
    <div class="coll-name" :style="props.collInfo.tid === hook.coll.tid ? 'color:#4C8BF5' : ''">{{ props.collInfo.name }}</div>
    
    <div v-if="hook.coll.status === 'edit' && props.collInfo.tid !== 0" class="coll-item-manager" @click.stop="">
      <div @click="hook.coll.collItem.delete(props.collInfo.tid)" class="coll-btn">delete</div>
      <div @click="hook.coll.collItem.showDialog(props.collInfo.name, props.collInfo.tid)" class="coll-btn">edit</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject } from "vue";
import { IOptionBaseHook } from "@/interface/options";

const props:any = defineProps({
  collInfo: {
    required: true,
    type: Object,
  },
})

const hook = inject("baseHook") as IOptionBaseHook;
</script>


<style lang="scss" scoped>
.coll-item-box {
  box-sizing: border-box;
  position: relative;
  display: flex;
  align-items: center;
  height: 60px;
  font-size: 15px;
  cursor: pointer;
  width: 100%;
  .coll-name {
    // color: #333;
  }
  .coll-item-manager {
    position: absolute;
    right: 0;
    height: 100%;
    display: flex;
    align-items: center;
    // padding-right: 10px;
    .coll-btn {
        padding-right: 15px;
        // color: var();
    }
  }
}
</style>