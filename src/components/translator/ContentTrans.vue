<template>
  <div
    v-if="(translator.mode === 'pdf' || translator.configInfo.isTreadWord) && text.replace(/\s/g, '') !== ''"
    class="tap-to-translate to-translate-icon"
    @click="translate"
    :style="toTranslateStyle"
  >
    <svg
      width="23px"
      height="23px"
      viewBox="0 0 434 434"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
    >
      <title>logo</title>
      <g
        id="logo"
        stroke="none"
        stroke-width="1"
        fill="none"
        fill-rule="evenodd"
      >
        <rect
          fill="#FFFFFF"
          opacity="0"
          x="0"
          y="0"
          width="434"
          height="434"
        ></rect>
        <rect
          id="矩形备份"
          stroke="#4C8BF5"
          stroke-width="21"
          fill="#FFFFFF"
          x="209.5"
          y="46.5"
          width="201"
          height="349"
          rx="33"
        ></rect>
        <path
          d="M375.260352,305.98 L385.700352,289.96 C358.340352,279.88 335.300352,267.64 316.760352,252.88 C333.320352,234.7 345.920352,212.2 354.560352,185.2 L381.740352,185.2 L381.740352,166.48 L313.700352,166.48 C308.300352,154.78 302.360352,144.7 295.880352,136.24 L276.980352,143.08 C283.460352,150.46 289.040352,158.2 293.540352,166.48 L222.260352,166.48 L222.260352,185.2 L249.620352,185.2 C257.180352,211.3 270.680352,234.16 290.120352,253.96 C271.400352,269.8 247.640352,281.32 219.020352,288.7 L229.100352,305.26 C258.440352,296.98 283.280352,283.84 303.440352,266.02 C322.520352,281.86 346.460352,295.18 375.260352,305.98 Z M303.440352,241.18 C286.880352,224.98 275.000352,206.44 267.620352,185.2 L335.120352,185.2 C328.100352,206.98 317.480352,225.7 303.440352,241.18 Z"
          id="文"
          fill="#4C8BF5"
          fill-rule="nonzero"
        ></path>
        <path
          d="M243.39451,4.24057464 C251.329227,4.54823029 256.553112,5.70462856 259.066167,7.70976946 C262.735184,10.6372407 265.046806,14.9726873 266.001034,20.7161092 L265.999,411.6 L265.959131,412.10433 C265.224146,420.830352 263.095929,426.393968 259.574483,428.795178 C256.75442,430.718128 252.72427,431.902049 247.484032,432.346941 L21.4414241,399.950352 C19.5585709,399.094989 18.183319,398.205148 17.3156684,397.280828 C16.1717555,396.062202 15.0665327,393.922148 14,390.860665 L14,49.3689722 C15.3400745,44.9434413 16.4854675,42.0867205 17.4361791,40.7988096 C18.3868906,39.5108988 20.7020115,37.7285137 24.3815417,35.4516545 L24.007,35.684 L243.39451,4.24057464 Z M266,1 L266.000352,1.16550455 L261.035,1.712 L266,1 Z"
          id="形状结合"
          fill="#4E8AF0"
        ></path>
        <path
          d="M135.886902,300.172326 L135.886902,278.520877 L61.0881833,271.157122 L61.0881833,230.578984 L128.497149,231.637686 L128.497149,210.269312 L61.0881833,211.792809 L61.0881833,174.596183 L132.822859,167.534076 L132.822859,146 L40.0003517,158.693854 L40.0003517,287.059451 L135.886902,300.172326 Z M174.457808,305.447054 L174.457808,233.515976 C175.17876,224.034482 177.70209,216.598278 182.027799,211.40137 C185.812795,206.617539 190.318741,204.124786 195.365402,203.972063 C209.423956,203.546622 216.453234,213.723718 216.453234,234.750729 L216.453234,311.190098 L237.000352,314 L237.000352,232.576057 C237.000352,196.330916 225.28489,179.244466 202.034203,180.7942 C196.446829,181.166616 191.400169,182.92967 186.713984,186.299048 C182.208037,189.377691 178.062566,194.025511 174.457808,199.747689 L174.457808,185.870311 L153.91069,187.12965 L153.91069,302.637152 L174.457808,305.447054 Z"
          id="En备份"
          fill="#FFFFFF"
          fill-rule="nonzero"
        ></path>
      </g>
    </svg>
  </div>

  <div
    v-if="translator.findStatus === 'loading'"
    ref="transLoadingDOM"
    class="content-trans-loading"
    :style="toTranslateStyle"
  >
    <Loading />
  </div>

  <div
    v-if="
      resultStyle.hold ||
      (translator.findStatus !== 'none' && translator.findStatus !== 'loading')
    "
    ref="resultDOM"
    class="result"
    :style="resultStyle"
  >
    <Translator @loadOK="setResultPostion" />
  </div>
</template>

<script lang="ts">
import Loading from "@/components/base/Loading.vue";
import {
  defineComponent,
  ref,
  onMounted,
  provide,
  reactive,
  watchEffect,
} from "vue";
import { translatorHook } from "@/hook/translatorHook";
import Translator from "./Translator.vue";
// import {eventToGoogle} from "../../utils/analytics"

export default defineComponent({
  props: {
    mode: String,
  },
  setup(props) {
    const resultDOM = ref<any | null>(null);
    const transLoadingDOM = ref<any | null>(null);
    const text = ref("");
    const toTranslateStyle = {
      top: "5px",
      left: "5px",
    };

    const showToTrans = ref(false);

    const resultStyleData = reactive({
      width: 300,
      height: 0,
      x: 0,
      y: 0,
    });

    const resultStyle = reactive({
      hold: false,
      top: `5px`,
      left: `5px`,
      width: `${resultStyleData.width}px`,
      setHold() {
        translator.toAnalytics({
          name: "setHold",
          params: { status: !resultStyle.hold },
        });
        resultStyle.hold = !resultStyle.hold;
      },
      moveBarTap() {
        translator.toAnalytics({ name: "moveTap", params: {} });
      },
    });

    provide("resultStyle", resultStyle);

    //@ts-ignore
    const translator = translatorHook(props.mode);

    provide("translator", translator);
    const popupElm = reactive({
      from: ref(null),
      to: ref(null),
    });
    provide("popupElm", popupElm);

    function translate(e: any) {
      // translate want select text and click logo
      translator.translateText({
        text: text.value,
        type: "select",
        findStatus: "loading",
      });
    }

    watchEffect(() => {
      // auto change Geometric size
      if (!translator.find.result) return;
      const maxLen = Math.max(
        translator.find.text.length,
        translator.find.result.text.length
      );
      if (maxLen > 180) {
        resultStyle.width = 380 + "px";
      } else {
        resultStyle.width = 300 + "px";
      }
    });

    onMounted(() => {
      document.addEventListener("mouseup", (e: any) => {
        if (resultDOM.value) {
          let out = true;
          e.path.some((elm: any) => {
            if (typeof elm.className === "string") {
              if (
                elm.className.indexOf("wsrfhedsoufheqiwrhew") !== -1
              ) {
                out = false;
                return true;
              }
            }
          });
          if (!out) return;

          if (!resultDOM.value.contains(e.target)) {
            translator.findStatus = "none";
          }
        } else if (transLoadingDOM.value) {
          if (!transLoadingDOM.value.contains(e.target)) {
            translator.findStatus = "none";
          }
        }

        setTimeout(async () => {
          //@ts-ignore
          text.value = window.getSelection().toString();
          if (!text.value.replace(/\s/g, "")) return;
          translator.configInfo.getTreadWord()
          // if (resultDOM.value) {
          //   showToTrans.value = false;
          // } else {
          //   showToTrans.value = true;
          // }
          setToTranslatePostion(e.clientX, e.clientY);
        });
      });
    });

    function setToTranslatePostion(x: number, y: number) {
      // set the position of logo icon which click to will translate the select text
      let left = x + 5;
      let top = y + 15;
      if (window.innerWidth - left < 40) {
        left = window.innerWidth - 40;
      }
      if (window.innerHeight - top < 40) {
        top = window.innerHeight - 40;
      }
      toTranslateStyle.left = left + "px";
      toTranslateStyle.top = top + "px";
      resultStyleData.x = left;
      resultStyleData.y = top;
    }

    function setResultPostion() {
      if (resultStyle.hold) return;
      const rw = resultDOM.value.offsetWidth;
      const rh = resultDOM.value.offsetHeight;
      const ww = window.innerWidth;
      const wh = window.innerHeight;

      const changeLeft = () => {
        if (left + rw >= ww) {
          left = ww - rw - 20;
        }
        if (left < 0) {
          left = 10;
        }
      };

      // left
      let left = resultStyleData.x - rw / 2;
      changeLeft();

      // top
      let top = resultStyleData.y;
      if (top + rh >= wh) {
        top = wh - rh - 20;
        left = resultStyleData.x;
        changeLeft();
      }
      if (top < 0) {
        top = 10;
        left = resultStyleData.x;
        changeLeft();
      }
      resultStyle.left = left + "px";
      resultStyle.top = top + "px";
    }

    return {
      resultDOM,
      transLoadingDOM,
      text,
      translator,
      resultStyle,
      toTranslateStyle,
      translate,
      setResultPostion,
      
    };
  },
  components: {
    Translator,
    Loading,
  },
});
</script>

<style scoped lang="scss">
@import "../../app.scss";

.tap-to-translate {
  position: fixed;
  z-index: 2147483647;
  width: 23px;
  height: 23px;
  background-size: cover;
}

.to-translate-icon {
  width: 23px;
  height: 23px;
}

.content-trans-loading {
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2147483647;
  width: 35px;
  height: 35px;
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 0 3px #444;
}

.result {
  position: fixed;
  z-index: 21474836;
  background-color: white;
  box-shadow: 0 0 3px #444;
  border-radius: $transRadius;
  overflow: hidden;
}
</style>