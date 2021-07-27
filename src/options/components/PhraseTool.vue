<template>
    <div class="phare-tool-wrap">
      <!-- <div class="icon-item-box">
        <IconBtn v-if="hook.coll.playTTSInfo.isPlayList" type="icon-tingzhi" iconSize=18 @click="hook.coll.playList" />
        <IconBtn v-else type="icon-yinpin" iconSize=18 @click="hook.coll.playList" />
      </div> -->
      <div class="icon-item-box">
        <IconBtn v-if="hook.coll.showParaphrase" type="icon-kejian2" iconSize=22 @click="hook.coll.setShowParaphrase" />
        <IconBtn v-else type="icon-bukejian2" iconSize=18 @click="hook.coll.setShowParaphrase" />
      </div>
        <!-- <PhraseToolBtn
          :text="hook.coll.showMarks ? '隐藏标记' : '显示标记'"
          :icon="
            hook.coll.showMarks
              ? 'icon-biaoji'
              : 'icon-yibiaoji'
          "
          :border="true"
          @tap="hook.coll.setShowMarks"
        /> -->
    </div>
</template>

<script lang="ts">
import { defineComponent, inject } from 'vue'
// import PhraseToolBtn from '@/options/components/PhraseToolBtn.vue'
import {IOptionBaseHook} from '@/interface/options'
import IconBtn from "@/components/base/IconBtn.vue";

export default defineComponent({
    setup() {
        const hook = <IOptionBaseHook>inject('baseHook')

        return {
            hook
        }
    },
    components: {
        // PhraseToolBtn,
        IconBtn
    }
})
</script>

<style lang="scss">
    .phare-tool-wrap {
        display: flex;
        flex-wrap: nowrap;
        padding-right: 20px;
        .icon-item-box {
          padding: 0 5px 0 5px;
        }
    }
</style>
