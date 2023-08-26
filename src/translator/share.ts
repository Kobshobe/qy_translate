import { IWrapTransInfo } from '@/interface/trans'
import { getFromeStorage } from '@/utils/chromeApi'
import { eventToGoogle } from '@/utils/analytics'
import { Context } from '@/api/context'
import {IBaseResp} from '@/api/request'

export class BaseTrans {
  maxLenght: number = 2000
  SLangToELang?: Map<string, string>
  ELangToSLang?: Map<string, string>
  LangSupport: any
  start = 0

  async setLangCode(c: Context): Promise<string> {
    const info: IWrapTransInfo = c.req
    info.fromCp = info.from
    info.toCp = info.to

    const langs = await getFromeStorage(['mainLang', 'secondLang'])
    langs.mainLang || (langs.mainLang = 'en');
    langs.secondLang || (langs.secondLang = 'en');

    if (!info.from || info.from === 'auto') {
      const detecteResp = await this.detectTextLang(new Context({text: c.req.text}))

      if (detecteResp.err) {
        this.setDetectLangErrResp(c, detecteResp)
        info.fromCode = undefined
        return '__transReqErr__'
      } else {
        info.fromCode = detecteResp.res.lang
      }

      info.from = this.getSLang(info.fromCode)
    } else {
      info.fromCode = this.getELang(info.from)
    }

    if (info.to && info.to !== '__auto__') {
      info.toCode = this.getELang(info.to)
    } else {
      if (info.from === langs.mainLang) {
        info.to = langs.secondLang
      } else {
        info.to = langs.mainLang
      }
      info.toCode = this.getELang(info.to)
    }

    info.isDetectedLang = true
    if (!info.from || !info.to) {
      this.setLangNotSupportResp(c)
      return '__noSupportLang__'
    } else {
      info.sFrom = this.getSLang(info.fromCode)
      info.sTo = this.getSLang(info.toCode)
    }
    return ''
  }

  async detectTextLang(c: Context): Promise<IBaseResp> {
    const resp = <IBaseResp>{res: {lang: 'en'}} // need when success
    return resp
  }

  async getStorageLang() {
    return await getFromeStorage(['mainLang', 'secondLang'])
  }

  checkTextLen(c: Context): any | null {
    const info: IWrapTransInfo = c.req
    if (info.text.length > this.maxLenght) {
      eventToGoogle({
        name: 'transTooLong',
        params: {
          engine: info.engine,
          tLen: info.text.length
        }
      })
      c.err = "textTooLong"
      c.toastMsg = {
        type: 'i18n',
        message: '__textTooLong__'
      }
    }
    return null
  }

  setSELang(SToElang: Iterable<readonly [string, string]>) {
    this.SLangToELang = new Map(SToElang)
    //@ts-ignore
    this.ELangToSLang = new Map(SToElang.map(([a, b]) => [b, a]))
  }

  /**
 * get trans engine's fromCode and toCode from standard lang sFrom and sTo.
 *
 * @param {Context} c the request context
 *
 * @returns {boolean} is set engine lang err?
 */
  setELangsFromSlangs(c: Context): boolean {
    const info: IWrapTransInfo = c.req
    info.fromCode = this.getELang(info.sFrom)
    info.toCode = this.getELang(info.sTo)
    if (info.fromCode && info.toCode) return false
    return true
  }

  zhDetect(info: IWrapTransInfo, mainLang: string, secondLang: string) {
    if (mainLang !== 'zh-CN' && mainLang !== 'zh-TW') {
      return
    }
    const sameRangeLang = ['zh-CN', 'zh-TW', 'ja']
    if (sameRangeLang.includes(secondLang)) {
      return
    }
    const re = /^[\u4E00-\u9FA5]+$/;
    if (re.test(info.text)) return;

  }

  getSLang(lang?: string): string | undefined {
    if (!lang) return ''
    return this.ELangToSLang && this.ELangToSLang.get(lang)
  }

  getELang(lang?: string): string | undefined {
    if (!lang) return ''
    return this.SLangToELang && this.SLangToELang.get(lang)
  }

  checkDMLang(from: string, to: string, engine: string): '__noSupportLang__' | '__onlyEnAndZh__' | '__onlyZhToZh__' | '' {
    if (this.LangSupport[engine].support[from] && this.LangSupport[engine].support[from].has(to)) {
      return ''
    }
    return this.LangSupport[engine].noSupportMsg
  }

  setExtraMsg(c: Context, key: string, value: any) {
    const info: IWrapTransInfo = c.req
    if (!info.extraMsg) {
      info.extraMsg = new Map()
    }
    info.extraMsg.set(key, value)
  }

  setLangNotSupportResp(c: Context, err: '__noSupportLang__' | '__onlyEnAndZh__' | '__onlyZhToZh__' = '__noSupportLang__') {
    c.err = err
    c.dialogMsg = {
      message: err,
      type: 'i18n'
    }
    eventToGoogle({
      name: 'noSupportLang',
      params: {
        engine: c.req.engine,
        tLen: c.req.text.length,
        form: c.req.from,
        to: c.req.to,
        fromCp: c.req.fromCp,
        toCp: c.req.toCp,
        context: c.req.text.slice(0, 100)
      }
    })
  }

  setDetectLangErrResp(c: Context, detected: IBaseResp) {
    if (!detected.data) {
      c.err = '__unknown__'
      c.dialogMsg = {
        message: "__reqErr__",
        type: 'i18n'
      }
    } else if (detected.err === '__fetchErr__') {
      c.err = '__fetchErr__'
      c.toastMsg = {
        message: "__fetchErr__",
        type: 'i18n'
      }
    } else {
      c.err = 'transDetectLangErr'
      c.dialogMsg = {
        message: '__transReqErr__',
        type: 'i18n'
      }
    }
  
    c.resp = detected.data

    eventToGoogle({
      name: 'detectLangReqErr',
      params: {
        engine: c.req.engine,
        tLen: c.req.text.length,
        textPart: c.req.text.slice(0, 100),
        form: c.req.from,
        to: c.req.to,
        fromCp: c.req.fromCp,
        toCp: c.req.toCp,
        //@ts-ignore
        errMsg: `${c.resp.errMsg}_${c.resp.status}`
      }
    })
  }

  transErrToAnalytic(c: Context, apiCtx: Context, other: any = {}) {
    const info: IWrapTransInfo = c.req
    const params = {
      from: info.from,
      to: info.to,
      type: info.type,
      textLenght: info.text.length,
      cost: info.cost,
      errMsg: `${info.engine}_${apiCtx.err}`,
      transMode: info.mode,
      engine: info.engine,
      respErr: apiCtx.err,
    }
    other && (Object.assign(params, other))
    eventToGoogle({
      name: 'transErr',
      params
    })
  }

  transOKToAnalytic(c: Context, respCtx: Context, other: any = {}) {
    const info: IWrapTransInfo = c.req
    const params = {
      from: info.from,
      to: info.to,
      type: info.type,
      tLen: info.text.length,
      cost: info.cost,
      transMode: info.mode,
      engine: info.engine,
      changeEngine: info.extraMsg && info.extraMsg.get('__changeEngine__')
    }
    other && (Object.assign(params, other))
    eventToGoogle({
      name: 'transOK',
      params
    })
  }

  startTiming() {
    this.start = new Date().valueOf()
  }

  getCost(c: Context) {
    c.req.cost = new Date().valueOf() - this.start
  }
}