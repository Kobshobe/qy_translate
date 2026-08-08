import { collectResult, reduceCollect, updateMark } from '@/api/api'
import { wrapTranslator } from '@/translator/transWrap'
import { getAudioBase64 } from '@/translator/tts'
import { openOptionsPage } from '@/utils/chromeApi'
import { eventToGoogle } from './analytics'
import { Context } from '@/api/context'

/** 回发消息到内容端；页面刷新/关闭后 port 已断开，静默丢弃结果即可 */
function safePost(port: any, payload: any): void {
  try {
    port.postMessage(payload)
  } catch {
    // "Attempting to use a disconnected port object" — 页面已不存在，无需处理
  }
}

export const apiWrap = {
  translate: async (msg: Context, port: any) => {
    safePost(port, await wrapTranslator.trans(msg))
  },
  collect: async (c: Context, port:any) => {
    safePost(port, await collectResult(c))
  },
  reduceCollect: async (c: Context, port: any) => {
    safePost(port, await reduceCollect(c))
  },
  updateMark: async (c: Context, port: any) => {
    safePost(port, await updateMark(c))
  },
  tts: async (c: Context, port: any) => {
    safePost(port, await getAudioBase64(c))
  },
  openOptionsPage: (c: Context, port: any) => {
    openOptionsPage(c.req)
  },
  analytic: async (c: Context, port: any) => {
    eventToGoogle(c.req)
  },

  /**
   * 页面翻译：处理单个段落的翻译请求
   * msg.req: { id, text, from, to, engine }
   */
  pageTrans: async (msg: any, port: any) => {
    const { id, text, from, to, engine } = msg
    const context = new Context({ text, from, to, type: 'pageTrans', engine })
    await wrapTranslator.trans(context)
    const result = context.res?.text || ''
    const error = context.err || null
    safePost(port, { id, text: result, error })
  },
}