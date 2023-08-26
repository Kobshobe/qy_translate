import { applyBDDM, collectResult, reduceCollect, updateMark } from '@/api/api'
import { wrapTranslator } from '@/translator/transWrap'
import { getAudioBase64 } from '@/translator/tts'
import { openOptionsPage } from '@/utils/chromeApi'
import { eventToGoogle } from './analytics'
import { Context } from '@/api/context'

export const apiWrap = {
  translate: async (msg: Context, port: any) => {
    port.postMessage(await wrapTranslator.trans(msg))
  },
  collect: async (c: Context, port:any) => {
    port.postMessage(await collectResult(c))
  },
  reduceCollect: async (c: Context, port: any) => {
    port.postMessage(await reduceCollect(c))
  },
  updateMark: async (c: Context, port: any) => {
    port.postMessage(await updateMark(c))
  },
  tts: async (c: Context, port: any) => {
    port.postMessage(await getAudioBase64(c))
  },
  openOptionsPage: (c: Context, port: any) => {
    openOptionsPage(c.req)
  },
  analytic: async (c: Context, port: any) => {
    eventToGoogle(c.req)
  },
  applyBDDM: async (c: Context, port: any) => {
    port.postMessage(await applyBDDM(c))
  }
}