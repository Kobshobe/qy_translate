<template>
  <div class="qr-login-box">
    <div v-if="loginStatus === 'loadingQr'">
      <div class="qr-img-box">
        <Loading size="50" />
      </div>
      <div class="qr-tip">二维码加载中...</div>
    </div>

    <div v-else-if="loginStatus === 'scanQr'">
      <div class="qr-img-box">
        <img class="qr-img" :src="qrUrl" alt="" />
      </div>
      <div class="qr-tip">使用微信扫码登录</div>
    </div>

    <div
      v-else-if="loginStatus === 'invalidQr' || loginStatus === 'loadQrFail'"
    >
      <div class="qr-img-box">
        <div class="qr-invalid" @click="reLoadQr">
          <div v-if="loginStatus === 'invalidQr'" class="text-desc">
            <div>二维码失效</div>
            <div>点击刷新</div>
          </div>
          <div v-else-if="loginStatus === 'loadQrFail'" class="text-desc">
            <div>二维码加载失败</div>
            <div>点击重试</div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="loginStatus === 'loginOk'">
      <div class="qr-img-box">
        <div class="text-desc">
          <h1>已登录</h1>
          <div style="height: 10px"></div>
          <el-button plain @click="logout">退出登录</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import Loading from "../../components/base/Loading.vue";
import { qrLogin } from "../../api/api";
import { removeTokenInfo, getTokenFromStorage } from "../../utils/chromeApi";
import {eventToGoogle} from '../../utils/analytics'

export default defineComponent({
  props: {
    show: Boolean,
  },
  setup(props) {
    const qrUrl = ref("");
    const loginStatus = ref<
      "loginOk" | "none" | "scanQr" | "loadingQr" | "invalidQr" | "loadQrFail"
    >("none");

    isLogin();

    async function isLogin() {
      const token = await getTokenFromStorage();
      if (token !== "needLogin" && token !== "needRelogin") {
        loginStatus.value = "loginOk";
      }
    }

    const reLoadQr = () => {
      qrLogin({qrUrl, loginStatus});
    };

    function logout() {
      removeTokenInfo(() => {
        qrLogin({qrUrl, loginStatus});
      });
    }

    watch(
      () => props.show,
      (newVal) => {
        if (newVal) {
          if (
            loginStatus.value !== "scanQr" &&
            loginStatus.value !== "loginOk"
          ) {
            qrLogin({qrUrl, loginStatus});
          }
        }
      }
    );

    return {
      qrUrl,
      loginStatus,
      reLoadQr,
      logout,
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
}
</style>