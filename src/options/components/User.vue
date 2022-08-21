<template>
  <el-dropdown>
    <SvgIcon  type="icon-account" size=25 />
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-if="!hook.user.isLogin"
          @click="hook.user.isShowLogin = true"
          >{{ geti18nMsg("scanQR") }}</el-dropdown-item
        >
        <el-dropdown-item v-else @click="hook.user.logout">{{
          geti18nMsg("logout")
        }}</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script lang="ts">
import { defineComponent, inject } from "vue";
import { removeTokenInfo } from "@/utils/chromeApi";
import { geti18nMsg } from "@/utils/share";
import { eventToGoogle } from "@/utils/analytics";
import {IOptionBaseHook} from '@/interface/options'
import SvgIcon from '../base/SvgIcon.vue';

export default defineComponent({
  setup() {
    const hook = inject("baseHook") as IOptionBaseHook;

    return {
      geti18nMsg,
      hook,
    };
  },
});
</script>
