import { applyBDDM, collectResult, reduceCollect, updateMark } from '@/api/api'
import { wrapTranslator } from '@/translator/transWrap'
import { getAudioBase64 } from '@/translator/tts'
import { openOptionsPage, getTransConf } from '@/utils/chromeApi'
import { IContext, IResponse, IWrapTransInfo } from '@/utils/interface'
import { eventToGoogle } from './analytics'

export const apiWrap = {
  translate: async (msg: IContext, port: any) => {
    port.postMessage(await wrapTranslator.trans(msg))
  },
  collect: async (c: IContext, port:any) => {
    port.postMessage(await collectResult(c))
  },
  reduceCollect: async (c: IContext, port: any) => {
    port.postMessage(await reduceCollect(c))
  },
  updateMark: async (c: IContext, port: any) => {
    port.postMessage(await updateMark(c))
  },
  tts: async (c: IContext, port: any) => {
    port.postMessage(await getAudioBase64(c))
  },
  openOptionsPage: (c: IContext, port: any) => {
    openOptionsPage(c)
  },
  analytic: async (c: IContext, port: any) => {
    eventToGoogle(c.req)
  },
  applyBDDM: async (c: IContext, port: any) => {
    port.postMessage(await applyBDDM(c))
  }
}