import { collectResult, reduceCollect, updateMark } from '@/api/api'
import { wrapTranslator } from '@/translator/transWrap'
import { getAudioBase64 } from '@/translator/tts'
import { openOptionsPage } from '@/utils/chromeApi'
import { eventToGoogle } from './analytics'
import { Context } from '@/api/context'
import { BATCH_SEP, splitBatchResult } from '@/translator/batch'

/** 回发消息到内容端；页面刷新/关闭后 port 已断开，静默丢弃结果即可 */
function safePost(port: any, payload: any): void {
  try {
    port.postMessage(payload)
  } catch {
    // "Attempting to use a disconnected port object" — 页面已不存在，无需处理
  }
}

/**
 * 页面翻译（批量）：一段消息携带多个段落，翻译引擎只发一次 HTTP 请求。
 *
 * msg.req: { id, texts: string[], from, to, engine }
 *
 * - 机器翻译引擎（google/bing/baidu）：把段落用分隔符拼成一个文本请求，
 *   响应按分隔符切回 1:1。这是页面翻译慢的主因（N 个段落 = N 次网络往返），
 *   批量后约 N/10 次。
 * - LLM 引擎：同样拼接批量请求，系统提示词已要求模型保留分隔符；
 *   若模型仍改动分隔符（数量对不上），落到逐条翻译保证正确性。
 *
 * 后台按 port.name 分发 handler，页面翻译统一走 'pageTrans' 端口，
 * 因此本函数由 pageTrans 根据 msg.type 调用。
 */
async function transBatch(msg: any, port: any): Promise<void> {
  const { id, texts, from, to, engine } = msg
  const list: string[] = Array.isArray(texts) ? texts : []
  if (list.length === 0) {
    safePost(port, { id, texts: [], error: null })
    return
  }

  // 所有引擎：多个段落拼成一次请求。
  if (list.length > 1) {
    const joined = list.join(BATCH_SEP)
    const context = new Context({ text: joined, from, to, type: 'pageTrans', engine })
    await wrapTranslator.trans(context)
    if (context.err) {
      // 请求失败：整组报错，由内容端整组重试（带退避）
      safePost(port, { id, texts: [], error: context.err })
      return
    }
    const parts = splitBatchResult(context.res?.text || '', list.length)
    if (parts) {
      safePost(port, { id, texts: parts, error: null })
      return
    }
    // 分隔符被引擎改动（数量对不上）：落到逐条翻译，保证正确性
  }

  // 单条 / 拼接失败回退：逐条翻译
  const results: string[] = []
  let firstErr: string | null = null
  for (const text of list) {
    const context = new Context({ text, from, to, type: 'pageTrans', engine })
    await wrapTranslator.trans(context)
    results.push(context.res?.text || '')
    if (context.err && !firstErr) firstErr = context.err
  }
  safePost(port, { id, texts: results, error: firstErr })
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
   * 批量请求（type: 'pageTransBatch'）也走此端口，按 type 分流。
   */
  pageTrans: async (msg: any, port: any) => {
    if (msg.type === 'pageTransBatch') {
      return transBatch(msg, port)
    }
    const { id, text, from, to, engine } = msg
    const context = new Context({ text, from, to, type: 'pageTrans', engine })
    await wrapTranslator.trans(context)
    const result = context.res?.text || ''
    const error = context.err || null
    safePost(port, { id, text: result, error })
  },
}