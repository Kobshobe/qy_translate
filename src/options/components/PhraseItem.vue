<template>
  <div
    :class="hook.coll.playTTSInfo.nowPlayIndex === index ? 'phrase-item-box phrase-item-box-play' : 'phrase-item-box'"
  >
    <div class="phrase-item-box-total">
      <div
        class="sound-btn"
        :style="hook.coll.status === 'edit' ? 'background-color:white;' : ''"
      >
        <SvgIcon
          v-if="hook.coll.status !== 'edit'"
          type="icon-huaban"
          :size="14"
          @click="hook.coll.playTTS(index)"
        />
        <x-checkbox v-else v-model="isChoice" @change="check"></x-checkbox>
      </div>

      <div class="phrase-item-text-box">
        <div v-if="hook.coll.showMarks" class="orig-text" v-html="markHtml"></div>
        <div v-else class="orig-text">{{ itemInfo.text }}</div>
        <div
          v-if="hook.coll.showParaphrase && itemInfo.translation"
          class="pharaphrase-text"
        >
          {{ itemInfo.translation }}
        </div>
      </div>

    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, ref, watchEffect } from "vue";
import { getMarkHtmlFromStr } from "@/utils/mark";
import { IOptionBaseHook, IPhraseInfo } from "@/interface/options";
import SvgIcon from "@/components/base/SvgIcon.vue";

export default defineComponent({
  props: {
    phraseInfo: Object,
    index: {
      default: -10,
    },
  },
  components: {
    SvgIcon,
  },
  setup(props: any) {
    const isChoice = ref(false);
    const itemInfo: IPhraseInfo = props.phraseInfo;
    const hook = <IOptionBaseHook>inject("baseHook");

    const markHtml = getMarkHtmlFromStr(itemInfo.marks, itemInfo.text);

    function check(e: boolean) {
      if (hook.coll.status !== "edit") return;
      if (e) {
        hook.coll.selected.add(props.phraseInfo.tid);
      } else {
        hook.coll.selected.delete(props.phraseInfo.tid);
      }
    }

    watchEffect(() => {
      if (hook.coll.status) {
        isChoice.value = false;
      }
    });

    return {
      itemInfo,
      markHtml,
      check,
      hook,
      isChoice,
    };
  },
});
</script>

<style lang="scss">
.sound-btn {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 22px;
  width: 22px;
  background-color: #eee;
  border-radius: 8px;
  margin-right: 15px;
  flex-shrink: 0;
  cursor: pointer;
}

.phrase-item-box {
  box-sizing: border-box;
  width: 100%;
  padding: 0 30px 0 30px;
  .phrase-item-box-total {
    box-sizing: border-box;
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    box-sizing: border-box;
    width: 100%;
    min-height: 50px;
    padding: 30px 0 30px 0;
    border-bottom: 2px solid var(--xx-border-color);
    .phrase-item-text-box {
      width: 100%;
      padding-right: 10px;
      .orig-text {
        box-sizing: border-box;
        font-weight: bold;
        font-size: 15px;
        .mark-text {
        background: linear-gradient(transparent 65%, #81d3f8 50%);
        background-size: 200% 100%;
        background-repeat: no-repeat;
        background-position: 200% 0;
        background-position: 100% 0;
      }
      }
      .pharaphrase-text {
        font-size: 14px;
        // color: #aaa;
        padding-top: 15px;
      }
    }
  }
}
.phrase-item-box-play {
  background-color: #eee;
}
</style>