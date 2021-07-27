<template>
  <div v-if="hook.coll.loadStatus === 'loading'" class="status-main">
    <i class="el-icon-loading" style="font-size: 40px; color: #888"></i>
  </div>

  <div v-else-if="!hook.user.isLogin" class="status-main">
    <el-button type="primary" @click="hook.user.isShowLogin = true">{{
      geti18nMsg("scanQr")
    }}</el-button>
  </div>

  <div
    v-if="hook.user.isLogin"
    class="load-more-container"
  >
    <div
      v-if="hook.coll.loadStatus === 'loaded'"
      class="load-btn"
      @click="hook.coll.getPhraseList(hook.coll.tid, hook.coll.page + 1)"
    >
      more
    </div>
    <div v-else-if="hook.coll.loadStatus === 'noMore'">no more</div>
    <div v-else-if="hook.coll.loadStatus === 'loadingMore'">loading</div>
    <div
      v-else-if="hook.coll.loadStatus === 'loadFail' && hook.coll.page > 0"
      class="load-btn"
      @click="hook.coll.getPhraseList(hook.coll.tid, hook.coll.page + 1)"
    >
      Failed to load
    </div>
    <div
      v-else-if="hook.coll.loadStatus === 'loadFail' && hook.coll.page == 0"
      class="load-btn"
      @click="hook.coll.getPhraseList(hook.coll.tid, 1)"
    >
      Failed to load
    </div>
    <div v-else-if="hook.coll.loadStatus === 'empty'" class="status-main">
      <el-empty description="nothing"></el-empty>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject } from "vue";
import { geti18nMsg } from "@/utils/share";
import { IOptionBaseHook } from "@/interface/options";

export default defineComponent({
  setup() {
    const hook = <IOptionBaseHook>inject("baseHook");
    return {
      geti18nMsg,
      hook,
    };
  },
  components: {},
});
</script>

<style lang="scss">
.status-main {
  display: flex;
  justify-content: center;
  width: 100;
  padding-top: 160px;
}

.load-more-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 80px;
  font-size: 14px;
  color: #aaa;
  .load-btn {
    cursor: pointer;
  }
}
</style>
