<template>
  <div class="qr-login-box">
    <div v-if="loginStatus === 'loadingQr'">
      <div class="qr-img-box">
        <Loading size="50" />
      </div>
      <div class="qr-tip">{{ loadingQRMsg }}</div>
    </div>

    <div class="qr-loaded-box" v-else-if="loginStatus === 'scanQr'">
      <div class="qr-img-box">
        <img class="qr-img" :src="qrUrl" alt="" />
      </div>
      <div class="qr-tip">{{ weChatScanQRToLoginMsg }}</div>
    </div>

    <div
      v-else-if="loginStatus === 'invalidQr' || loginStatus === 'loadQrFail'"
    >
      <div class="qr-img-box">
        <div class="qr-invalid" @click="reLoadQr">
          <div v-if="loginStatus === 'invalidQr'" class="text-desc">
            <div>{{ invalidQRMsg }}</div>
            <div>{{ clickToRefreshMsg }}</div>
          </div>
          <div v-else-if="loginStatus === 'loadQrFail'" class="text-desc">
            <div>{{ loadQRFailMsg }}</div>
            <div>{{ clickReTryMsg }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="loginStatus === 'loginOk'">
      <i class="el-icon-circle-check" style="font-size: 25px; color: #888"></i>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, inject } from "vue";
import Loading from "../../components/base/Loading.vue";
import { qrLogin } from "../../api/ws";
import { removeTokenInfo, getTokenFromStorage } from "../../utils/chromeApi";
import { eventToGoogle } from "@/utils/analytics";
import {IOptionBaseHook} from '@/interface/options';
import { ElMessage } from "element-plus";
import {geti18nMsg} from '@/utils/share'

export default defineComponent({
  setup() {
    const hook = inject('baseHook') as IOptionBaseHook
    const qrUrl = ref("");
    const loginStatus =
      ref<
        "loginOk" | "none" | "scanQr" | "loadingQr" | "invalidQr" | "loadQrFail"
      >("none");

    isLogin();

    async function isLogin() {
      const token = await getTokenFromStorage();
      if (token !== "__needLogin__" && token !== "__needRelogin__") {
        loginStatus.value = "loginOk";
      } else {
        qrLogin({ qrUrl, loginStatus });
      }
    }

    const reLoadQr = () => {
      qrLogin({ qrUrl, loginStatus });
      eventToGoogle({
        name: 'reLoadQr',
        params: {}
      })
    };

    function logout() {
      removeTokenInfo(() => {
        qrLogin({ qrUrl, loginStatus });
      });
      eventToGoogle({
        name: 'logout',
        params: {}
      })
    }

    watch(()=>loginStatus.value ,(newVal, oldVal)=> {
      if(newVal === 'loginOk' && oldVal !== 'none') {
        hook.user.isLogin = true
        hook.user.isShowLogin = false
        ElMessage.info({message: geti18nMsg('__loginSuccess__'), type: 'info'})

        hook.coll.initColl()
      }
    })

    const loggedMsg = chrome.i18n.getMessage("logged");
    const logoutMsg = chrome.i18n.getMessage("logout");
    const loadingQRMsg = chrome.i18n.getMessage("loadingQR");
    const weChatScanQRToLoginMsg = chrome.i18n.getMessage(
      "weChatScanQRToLogin"
    );
    const invalidQRMsg = chrome.i18n.getMessage("invalidQR");
    const clickToRefreshMsg = chrome.i18n.getMessage("clickToRefresh");
    const loadQRFailMsg = chrome.i18n.getMessage("loadQRFail");
    const clickReTryMsg = chrome.i18n.getMessage("clickReTry");

    return {
      qrUrl,
      loginStatus,
      reLoadQr,
      logout,
      loggedMsg,
      logoutMsg,
      loadingQRMsg,
      weChatScanQRToLoginMsg,
      invalidQRMsg,
      clickToRefreshMsg,
      loadQRFailMsg,
      clickReTryMsg,
    };
  },
  components: {
    Loading,
  },
});
</script>

<style scoped lang='scss'>
.qr-login-box {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: center;
  height: 250px;
  .qr-loaded-box {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: center;
  }
  .qr-img-box {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 150px;
    height: 150px;
    padding: 10px 10px 20px 10px;
    .qr-img {
      width: 100%;
      height: 100%;
    }
    .qr-invalid {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      width: 100%;
      height: 100%;
      border-radius: 5px;
      background-color: #e9ecef;
      color: rgb(108, 117, 125);
      cursor: pointer;
      .text-desc {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }
    }
  }

  .qr-tip {
    display: flex;
    justify-content: center;
    font-size: 18px;
  }

  .qr-logged {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 370px;
    .logged-text {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
    }
    ::v-deep(.el-button) {
      width: 80px
    }
  }
}
</style>