<template>
  <div class="editing-main-wsrfhedsoufheqiwrhew">
    <div class="editing-top-wsrfhedsoufheqiwrhew">
      <div class="textarea-box-wsrfhedsoufheqiwrhew">
        <textarea
          name=""
          id="phrase-editing-wsrfhedsoufheqiwrhew"
          v-model="translator.editingText"
          @keydown="translator.translateFromEdit"
          :placeholder="enterTextMsg"
          :autofocus="true"
        ></textarea>
      </div>
      <div class="editing-clear-wsrfhedsoufheqiwrhew">
        <IconBtn
          v-if="translator.editingText !== ''"
          type="icon-guanbi"
          color="#AAAAAA"
          @click="translator.clear"
        />
        <IconBtn
          v-else-if="translator.lastFindText !== ''"
          type="icon-lishijilu"
          color="#AAAAAA"
          iconSize=16
          @click="translator.getLastFindText"
        />
      </div>
    </div>
    <div class="editing-tool-bar-wsrfhedsoufheqiwrhew">
      <div class="editing-tool-bar-left-wsrfhedsoufheqiwrhew">
        <div class="tread-switch-box-wsrfhedsoufheqiwrhew">
          <div class="tread-switch-text-wsrfhedsoufheqiwrhew">{{treadWordMsg}}</div>
          <el-switch v-model="translator.configInfo.isTreadWord" active-color="#4C8BF5" @change="translator.configInfo.changeTreadWord"> </el-switch>
        </div>
      </div>
      <div class="editing-tool-bar-right-wsrfhedsoufheqiwrhew">
        <div class="edge-width-wsrfhedsoufheqiwrhew"></div>
        <div
          v-if="translator.findStatus !== 'loading'"
          style="transform: rotate(180deg)"
        >
          <IconBtn
            type="icon-zuojiantou"
            iconSize="20"
            @click="
              translator.translateText({
                text: translator.editingText,
                type: 'edit_icon',
                findStatus: 'loading',
              })
            "
          />
        </div>
        <Loading v-else />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, onMounted, ref } from "vue";
import { ITranslatorHook } from "@/utils/interface";
import IconBtn from "../base/IconBtn.vue";
import Loading from "../base/Loading.vue";

export default defineComponent({
  setup() {
    const translator = <ITranslatorHook>inject("translator");
    const on = ref(true);

    onMounted(() => {
      document.execCommand("paste");
    });

    const enterTextMsg = chrome.i18n.getMessage("enterText")
    const treadWordMsg = chrome.i18n.getMessage("treadWord")

    return {
      translator,
      on,
      enterTextMsg,
      treadWordMsg
    };
  },
  components: {
    IconBtn,
    Loading,
  },
});
</script>

<style lang="scss" scoped>
@import "../../app.scss";

#phrase-editing-wsrfhedsoufheqiwrhew {
  height: 100%;
  width: 100%;
  font-size: 18px;
  border: none;
  resize: none;
  outline: none;
}

.editing-main-wsrfhedsoufheqiwrhew {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  .editing-top-wsrfhedsoufheqiwrhew {
    display: flex;
    flex-wrap: nowrap;
    width: 100%;
    height: 188px;
    .textarea-box-wsrfhedsoufheqiwrhew {
      box-sizing: border-box;
      height: 100%;
      width: 100%;
      padding: 10px $transEdgePadding 0 $transEdgePadding;
    }
    .editing-clear-wsrfhedsoufheqiwrhew {
      position: absolute;
      top: 0;
      right: 0;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      width: 40px;
      height: 40px;
      flex-shrink: 0;
      padding-top: 12px;
    }
  }
  .editing-tool-bar-wsrfhedsoufheqiwrhew {
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 50px;
    padding: 0 $transEdgePadding 0 $transEdgePadding;
    .editing-tool-bar-left-wsrfhedsoufheqiwrhew {
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      width: 100%;
      height: 100%;
      .tread-switch-box-wsrfhedsoufheqiwrhew {
        display: flex;
        align-items: center;
        opacity: 0;
        transition: opacity 0.5s;
        width: 100%;
        .tread-switch-text-wsrfhedsoufheqiwrhew {
          font-size: 16px;
          padding-left: 5px;
          padding-right: 10px;
          color: #555;
        }
      }
      .tread-switch-box-wsrfhedsoufheqiwrhew:hover {
        opacity: 1;
      }
    }
    .editing-tool-bar-right-wsrfhedsoufheqiwrhew {
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      justify-content: flex-end;
      width: 100%;
      height: 100%;
    }
  }

  ::-webkit-scrollbar {
    width: 4px;
  }
  /* 滚动槽 */
  ::-webkit-scrollbar-track {
    -webkit-box-shadow: inset006pxrgba(0, 0, 0, 0.3);
    border-radius: 10px;
  }
  /* 滚动条滑块 */
  ::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.1);
    -webkit-box-shadow: inset006pxrgba(0, 0, 0, 0.5);
  }
}
</style>