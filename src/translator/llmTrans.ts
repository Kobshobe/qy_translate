import {BaseTrans} from '@/translator/share';
import {ITransResult, IWrapTransInfo, ILLMConfig} from '@/interface/trans';
import { Context } from '@/api/context';
import { SToGoogle, languages } from '@/translator/trans_base';
import { wrapTranslator } from '@/translator/transWrap';

export class LLMTrans extends BaseTrans {
  maxLenght = 8000

  constructor() {
    super()
    // LLM understands language names, use direct identity mapping
    // Use the same language set as Google Translate
    const langList = ['auto', ...[...SToGoogle].map(([k]) => k)]
    const identity = langList.map(l => [l, l] as [string, string])
    this.setSELang(identity)
  }

  async CTrans(c: Context): Promise<Context> {
    const info: IWrapTransInfo = c.req
    const engineId = info.engine?.replace('llm__', '')
    if (!engineId) {
      c.err = '__transReqErr__'
      return c
    }

    // Load LLM config from storage
    const result = await chrome.storage.sync.get('llmConfigs')
    const configs: ILLMConfig[] = result.llmConfigs || []
    const config = configs.find(cfg => cfg.id === engineId)

    if (!config) {
      c.err = '__transReqErr__'
      c.dialogMsg = { message: '__transReqErr__', type: 'i18n' }
      return c
    }

    // Use Baidu's language detection (same as Google Translate)
    await this.detectLang(c)
    if (c.err) return c

    const mainName = this.getLangName(info.from!)
    const toName = this.getLangName(info.to!)

    await this.translate(c, config, mainName, toName)
    return c
  }

  private async detectLang(c: Context): Promise<void> {
    const info: IWrapTransInfo = c.req
    const langs = await this.getStorageLang()
    langs.mainLang || (langs.mainLang = 'en')
    langs.secondLang || (langs.secondLang = 'en')

    // Detect source language using Baidu (same as Google Translate)
    if (!info.from || info.from === 'auto') {
      const detectResp = await wrapTranslator.baidu.detectTextLang(new Context({ text: info.text }))
      if (detectResp.err) {
        c.err = detectResp.err
        c.toastMsg = { message: '__fetchErr__', type: 'i18n' }
        return
      }
      const baiduLang = detectResp.res.lang
      const sLang = wrapTranslator.baidu.getSLang(baiduLang)
      info.from = this.getELang(sLang) || sLang || 'en'
    }

    // Determine target language
    if (!info.to || info.to === '__auto__') {
      if (info.from === langs.mainLang) {
        info.to = langs.secondLang
      } else {
        info.to = langs.mainLang
      }
    }
  }

  private getLangName(code: string): string {
    const lang = (languages as any)[code]
    return lang?.en || code
  }

  private buildSystemPrompt(fromName: string, toName: string): string {
    return `You are a professional translator. Translate the following text from ${fromName} to ${toName}. Reply with the translation only, no explanations, no notes, no JSON.`
  }

  private parseLLMResponse(raw: string): string {
    // Strip thinking/reasoning tags (e.g. DeepSeek R1, MiniMax M2.7)
    const cleaned = raw.replace(/<think>[\s\S]*?<\/think>/g, '').trim()
    // Strip JSON wrapper if model returns it anyway
    try {
      const json = JSON.parse(cleaned)
      return json.result || json.translation || json.text || cleaned
    } catch {
      return cleaned
    }
  }

  private async translate(c: Context, config: ILLMConfig, fromName: string, toName: string): Promise<void> {
    const info: IWrapTransInfo = c.req
    this.startTiming()

    try {
      const url = config.apiUrl.replace(/\/+$/, '') + '/chat/completions'
      const systemPrompt = this.buildSystemPrompt(fromName, toName)
      
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + config.apiKey,
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: info.text },
          ],
        }),
      })

      if (!resp.ok) {
        const errText = await resp.text()
        console.error('[LLMTrans] API error:', resp.status, errText)
        c.err = '__transReqErr__'
        c.dialogMsg = { message: '__transReqErr__', type: 'i18n' }
        return
      }

      const data = await resp.json()
      const rawContent = data.choices?.[0]?.message?.content?.trim() || ''
      const translation = this.parseLLMResponse(rawContent)

      c.res = {
        text: translation,
        resultFrom: info.from || 'auto',
        resultTo: info.to || '',
        engine: info.engine || '',
      } as ITransResult

      this.getCost(c)
      this.transOKToAnalytic(c, c)
    } catch (e) {
      console.error('[LLMTrans] fetch error:', e)
      c.err = '__fetchErr__'
      c.toastMsg = { message: '__fetchErr__', type: 'i18n' }
    }
  }
}
