<template>
  <div class="header">
    <div class="hearder-side">
      <div class="header-title">{{geti18nMsg('title')}}</div>
      <div class="header-tab">
        <router-link to="/collections"
          ><div class="tab-item">{{geti18nMsg('__collection__')}}</div></router-link
        >
        <router-link to="/"><div class="tab-item">{{geti18nMsg('__options__')}}</div></router-link>
        
        <router-link to="/other"
          ><div class="tab-item">{{geti18nMsg('__others__')}}</div></router-link
        >
      </div>
    </div>

    <div class="hearder-side">
      <User />
    </div>
  </div>
  <div class="content">
    <router-view></router-view>
  </div>
  <el-dialog v-model="baseHook.user.isShowLogin" width="300px">
    <QRLogin2 v-if="baseHook.user.isShowLogin"/>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, provide } from "vue";
import hook from "@/hook/optionPageHook";
import { optionBaseHook } from "@/hook/optionPageHook";
import User from "@/options/components/User.vue";
import QRLogin2 from '@/options/components/QRLogin2.vue';
import {geti18nMsg} from '@/utils/share';
import {IOptionBaseHook} from '@/interface/options';


export default defineComponent({
  setup() {
    document.title = geti18nMsg('title')
    const baseHook = <IOptionBaseHook>optionBaseHook();
    provide("baseHook", baseHook);

    return {
      baseHook,
      geti18nMsg
    };
  },
  components: {
    User,QRLogin2
  },
});
</script>


<style scoped lang="scss">
@import "@/app.scss";

a {
  text-decoration: none;
}

.header {
  box-sizing: border-box;
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
  border-bottom: 1px solid #efefef;
  z-index: 100;
  background-color: #fff;
  padding: 0 20px 0 20px;
  .hearder-side {
    display: flex;
  }
  .header-title {
    font-size: 20px;
    padding-right: 20px;
    color: #333;
  }
  .header-tab {
    display: flex;
    .tab-item {
      padding: 3px 20px 0 20px;
      font-size: 15px;
      color: #6e6d7a;
      font-weight: bold;
      cursor: pointer;
    }
    .tab-item:hover {
      color: $mainColor;
    }
  }
}

.content {
  box-sizing: border-box;
  display: flex;
  height: 100%;
  padding-top: 70px;
}
</style>