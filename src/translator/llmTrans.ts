import {BaseTrans} from '@/translator/share';
import {ITransResult, IWrapTransInfo, ILLMConfig} from '@/interface/trans';
import { Context } from '@/api/context';

export class LLMTrans extends BaseTrans {
  maxLenght = 8000

  constructor() {
    super()
    // LLM understands language names, use direct identity mapping
    const langList = ['auto', 'zh-CN', 'zh-TW', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru',
      'th', 'ar', 'hi', 'pt', 'vi', 'it', 'nl', 'pl', 'tr', 'sv', 'da', 'fi', 'cs', 'hu']
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

    const err = await this.setLangCode(c)
    if (err) return c

    await this.translate(c, config)
    return c
  }

  private async translate(c: Context, config: ILLMConfig): Promise<void> {
    const info: IWrapTransInfo = c.req
    this.startTiming()

    try {
      const url = config.apiUrl.replace(/\/+$/, '') + '/chat/completions'
      const systemPrompt = `You are a translator. Translate the following text from ${info.from || 'auto'} to ${info.to || 'en'}. Only return the translation, nothing else.`
      
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
      const translatedText = data.choices?.[0]?.message?.content?.trim() || ''

      c.res = {
        text: translatedText,
        resultFrom: info.from || '',
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

  async detectTextLang(c: Context): Promise<any> {
    // Simple fallback: assume English if no detection available
    // LLM APIs don't typically have a dedicated language detection endpoint
    return { res: { lang: 'en' } }
  }
}
