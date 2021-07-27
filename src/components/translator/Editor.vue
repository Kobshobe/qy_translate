<template>
  <div class="editing-main-wsrfhedsoufheqiwrhew">
    <div class="editing-top-wsrfhedsoufheqiwrhew">
      <div class="textarea-box-wsrfhedsoufheqiwrhew">
        <textarea
          name=""
          id="phrase-editing-wsrfhedsoufheqiwrhew"
          v-model="baseHook.E.editingText"
          @keydown="baseHook.E.enterTrans"
          :placeholder="enterTextMsg"
          :autofocus="true"
          ref="editorDOM"
          :style="baseHook.C.mode !== 'simple' ? 'padding-top:10px;': ''"
        ></textarea>
      </div>
      <div class="editing-clear-wsrfhedsoufheqiwrhew">
        <IconBtn
          v-if="baseHook.E.editingText !== ''"
          type="icon-guanbi1"
          iconSize=17
          color="#AAAAAA"
          @click="clear"
        />
        <IconBtn
          v-else-if="baseHook.E.lastFindText !== ''"
          type="icon-lishijilu"
          color="#AAAAAA"
          iconSize="16"
          @click="baseHook.E.getLastFindText"
        />
        <IconBtn
          v-else-if="baseHook.E.lastFindText === '' && baseHook.E.lastFindText === ''"
          type="icon-niantie1"
          color="#AAAAAA"
          iconSize="16"
          @click="baseHook.E.pasteAndTrans"
        />
      </div>
    </div>
    <div class="editing-tool-bar-wsrfhedsoufheqiwrhew">
      <div class="editing-tool-bar-left-wsrfhedsoufheqiwrhew">
        <LangController v-if="baseHook.C.mode === 'profession'" />
        <div v-else class="tread-switch-box-wsrfhedsoufheqiwrhew">
          <div class="tread-switch-text-wsrfhedsoufheqiwrhew">
            {{ treadWordMsg }}
          </div>
          <el-switch
            v-model="baseHook.C.isTreadWord"
            active-color="#4C8BF5"
            @change="baseHook.changeTreadWord"
          >
          </el-switch>
        </div>
      </div>
      <div class="editing-tool-bar-right-wsrfhedsoufheqiwrhew">
        <div class="edge-width-wsrfhedsoufheqiwrhew"></div>
        <div
          v-if="baseHook.findStatus !== 'editLoading'"
          style="transform: rotate(180deg)"
        >
          <IconBtn
            type="icon-zuojiantou"
            iconSize="20"
            @click="baseHook.E.trans"
          />
        </div>
        <Loading v-else />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  inject,
  onMounted,
  ref
} from "vue";
import { ITranslatorHook } from "@/interface/trans";
import IconBtn from "../base/IconBtn.vue";
import Loading from "../base/Loading.vue";
import LangController from "./LangController.vue";
import { editHook } from "@/hook/translatorHook";
import {IBaseHook} from '@/interface/trans';

export default defineComponent({
  setup() {
    const baseHook = <IBaseHook>inject("baseHook")
    const editorDOM = ref<any | null>(null);

    function clear() {
      baseHook.E.clear()
      editorDOM.value.focus()
    }

    onMounted(() => {
      editorDOM.value.focus()
    })

    const enterTextMsg = chrome.i18n.getMessage("enterText");
    const treadWordMsg = chrome.i18n.getMessage("treadWord");

    return {
      baseHook,
      enterTextMsg,
      treadWordMsg,
      editorDOM,
      clear
    };
  },
  components: {
    IconBtn,
    Loading,
    LangController,
  },
});
</script>

<style lang="scss" scoped>
@import "@/app.scss";

.editing-main-wsrfhedsoufheqiwrhew {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  transition: 2s height;
  .editing-top-wsrfhedsoufheqiwrhew {
    position: relative;
    display: flex;
    flex-wrap: nowrap;
    width: 100%;
    height: 230px;
    .textarea-box-wsrfhedsoufheqiwrhew {
      box-sizing: border-box;
      height: 100%;
      width: 100%;
      padding: 1px $transEdgePadding 0 $transEdgePadding;
      #phrase-editing-wsrfhedsoufheqiwrhew {
        height: 100%;
        width: 100%;
        font-size: 18px;
        border: none;
        resize: none;
        outline: none;
      }
    }
    .editing-clear-wsrfhedsoufheqiwrhew {
      position: absolute;
      top: -17px;
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
    padding: 0 $transEdgePadding 0 12px;
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
      width: 15%;
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