<template>
  <x-dropdown placement="bottom-end">
    <SvgIcon  type="icon-account" :size="25" color="var(--xx-text-color-regular)" />
    <template #dropdown>
      <x-dropdown-menu>
        <x-dropdown-item
          v-if="!hook.user.isLogin"
          @click="hook.user.isShowLogin = true"
          >{{ geti18nMsg("scanQR") }}</x-dropdown-item
        >
        <x-dropdown-item v-else @click="hook.user.logout">{{
          geti18nMsg("logout")
        }}</x-dropdown-item>
      </x-dropdown-menu>
    </template>
  </x-dropdown>
</template>

<script setup lang="ts">
import { defineComponent, inject } from "vue";
import { geti18nMsg } from "@/utils/share";
import {IOptionBaseHook} from '@/interface/options'
import SvgIcon from '@/components/base/SvgIcon.vue';

const hook = inject("baseHook") as IOptionBaseHook;

defineComponent({name: 'qy-user'})
</script>
