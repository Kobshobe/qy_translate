import { applyBDDM, collectResult, reduceCollect, updateMark } from '@/api/api'
import { wrapTranslator } from '@/translator/transWrap'
import { getAudioBase64 } from '@/translator/tts'
import { openOptionsPage, getTreadWord, setTreadWord } from '@/utils/chromeApi'
import { IRequestResult, IWrapTransInfo } from '@/utils/interface'
import { eventToGoogle, eventToAnalytic } from './analytics'

const apiWrap = {
  // ---------- trans
  translate: async (msg: IWrapTransInfo, port: any) => {
    const result: any = await wrapTranslator.trans(msg)
    return getRequestResultMsg({ port, res: result })
  },
  // ---------- collect or mark collect
  collect: async (msg: any, port: any) => {
    return await HandleResultCanTest(collectResult, msg, port)
  },
  // ---------- reduce collected
  reduceCollect: async (msg: any, port: any) => {
    return await HandleResultCanTest(reduceCollect, msg, port)
  },
  // ---------- update marks
  updateMark: async (msg: any, port: any) => {
    return await HandleResultCanTest(updateMark, msg, port)
  },
  // ---------- 播放声音
  tts: async (msg: any, port: any) => {
    const result = await getAudioBase64(msg.text, msg.audioType, {
      lang: msg.lang,
      slow: false,
      host: 'https://translate.google.cn',
    })
    port.postMessage(result)
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
  getTreadWordConf: async (msg: any, port: any) => {
    return await HandleResultCanTest(getTreadWord, msg, port)
  },
  applyBDDM: async (msg: any, port: any) => {
    return await HandleResultCanTest(applyBDDM, msg, port)
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