<template>
    <div class="phare-tool-wrap">
      <div class="icon-item-box">
        <IconBtn v-if="hook.coll.showParaphrase" type="icon-kejian2" :iconSize="22" @click="hook.coll.setShowParaphrase" />
        <IconBtn v-else type="icon-bukejian2" :iconSize="18" @click="hook.coll.setShowParaphrase" />
      </div>
    </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import {IOptionBaseHook} from '@/interface/options'
import IconBtn from "@/components/base/IconBtn.vue";

const hook = inject('baseHook') as IOptionBaseHook;
</script>

<style lang="scss">
    .phare-tool-wrap {
        display: flex;
        flex-wrap: nowrap;
        padding-right: 20px;
        background-color: var(--xx-fill-color-deep);
        .icon-item-box {
          background-color: var(--xx-fill-color-deep);
          padding: 0 5px 0 5px;
        }
    }
</style>
