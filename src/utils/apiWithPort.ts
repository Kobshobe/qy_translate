import { collectResult, reduceCollect, updateMark } from '../api/api'
import { Translator } from '../utils/translator'
import { getAudioBase64 } from '../utils/tts'
import { openOptionsPage, getTreadWord, setTreadWord } from '../utils/chromeApi'
import { IRequestResult } from '@/utils/interface'
import { eventToGoogle, eventToAnalytic } from './analytics'
import { client, clientVersion } from '../config'

const translator = new Translator();

const apiWrap = {
  // ---------- 翻译
  translate: async (msg: any, port: any) => {
    const result: any = await translator.findUseApi(msg)
    return getRequestResultMsg({ port, res: result })
  },
  // ---------- 收藏或标记收藏
  collect: async (msg: any, port: any) => {
    return await HandleResultCanTest(collectResult, msg, port)
  },
  // ---------- 取消收藏
  reduceCollect: async (msg: any, port: any) => {
    return await HandleResultCanTest(reduceCollect, msg, port)
  },
  // ---------- 更新标记
  updateMark: async (msg: any, port: any) => {
    return await HandleResultCanTest(updateMark, msg, port)
  },
  // ---------- 播放声音
  tts: async (msg: any, port: any) => {
    const audioBase64 = await getAudioBase64(msg.text, {
      lang: msg.lang,
      slow: false,
      host: 'https://translate.google.cn',
    })
    port.postMessage(audioBase64[0])
  },
  openOptionsPage: (msg: any, port: any) => {
    openOptionsPage(msg)
  },
  analytic: async (msg: any, port: any) => {
    return await HandleResultCanTest(eventToAnalytic, msg, port)
  },
  setTreadWord: async (msg: any, port: any) => {
    return await HandleResultCanTest(setTreadWord, msg, port)
  },
  getTreadWord: async (msg: any, port: any) => {
    return await HandleResultCanTest(getTreadWord, msg, port)
  }
}

function getRequestResultMsg({ port, res }: { port: chrome.runtime.Port | null, res: IRequestResult, extra?: any }) {

  if (port) {
    port.postMessage(res)
  } else {
    return res
  }

}

async function HandleResultCanTest(getResultFunc: Function, msg: any, port: null | chrome.runtime.Port): Promise<any> {
  const res = await getResultFunc({ data: msg })

  if (port) {
    port.postMessage(res)
  } else {
    return res
  }
}

export default apiWrap