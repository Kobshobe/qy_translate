<template>
  <div
    v-if="!hook.coll.collItem.deleted.includes(collInfo.tid)"
    class="coll-item-box"
    @click="hook.coll.getPhraseList(collInfo.tid, 1)"
  >
    <div class="coll-name" :style="collInfo.tid === hook.coll.tid ? 'color:#4C8BF5' : ''">{{ collInfo.name }}</div>
    <div v-if="hook.coll.status === 'edit' && collInfo.tid !== 0" class="coll-item-manager" @click.stop="">
      <div @click="hook.coll.collItem.delete(collInfo.tid)" class="coll-btn"><i class="el-icon-delete"></i></div>
      <div @click="hook.coll.collItem.showDialog(collInfo.name, collInfo.tid)" class="coll-btn"><i class="el-icon-edit"></i></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject } from "vue";
import { IOptionBaseHook } from "@/interface/options";

export default defineComponent({
  props: {
    collInfo: {
      required: true,
      type: Object,
    },
  },
  setup() {
    const hook = <IOptionBaseHook>inject("baseHook");
    return {
      hook,
    };
  },
});
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
    color: #333;
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
        color: #aaa;
    }
  }
}
</style>