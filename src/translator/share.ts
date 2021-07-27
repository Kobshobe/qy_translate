import {IContext,IResponse,IWrapTransInfo} from '@/interface/trans'
import {getFromeStorage} from '@/utils/chromeApi'
import {eventToGoogle} from '@/utils/analytics'
import { languages } from './language'

export class BaseTrans {
  maxLenght: number = 2000
  SLangToELang?: Map<string, string>
  ELangToSLang?: Map<string, string>
  LangSupport: any
  start = 0

  async setLangCode(c:IContext) :Promise<string> {
    const info:IWrapTransInfo = c.req
    info.fromCp = info.from
    info.toCp = info.to
    const langs = await getFromeStorage(['mainLang', 'secondLang'])
    langs.mainLang || (langs.mainLang = 'en');
    langs.secondLang || (langs.secondLang = 'en');

    if (!info.from || info.from === 'auto') {
      info.fromCode = await this.detect(c)
      if (info.fromCode === '__reqErr__') {
        this.setDetectLangErrResp(c)
        info.fromCode = undefined
        return '__reqErr__'
      }
      info.from = this.getSLang(info.fromCode)
    } else {
      info.fromCode = this.getELang(info.from)
    }

    if(info.to && info.to !== '__auto__') {
      info.toCode = this.getELang(info.to)
    } else {
      if(info.from === langs.mainLang) {
        info.to = langs.secondLang
      } else {
        info.to = langs.mainLang
      }
      info.toCode = this.getELang(info.to)
    }

    info.isDetectedLang = true
    if(!info.from || !info.to) {
      this.setLangNotSupportResp(c)
      return '__noSupportLang__'
    }
    return ''
  }

  async detect(c:IContext) :Promise<any> {
  }

  async getStorageLang() {
    return await getFromeStorage(['mainLang', 'secondLang'])
  }
  
  checkTextLen(c:IContext) :IResponse|null {
    const info:IWrapTransInfo = c.req
    if(info.text.length > this.maxLenght) {
      eventToGoogle({
        name: 'transTooLong',
        params: {
          engine:info.engine,
          tLen: info.text.length
        }
      })
      c.resp = {
        errMsg: 'textTooLong',
        toastMsg: {
            type: 'i18n',
            message: '__textTooLong__'
      }
    }
    }
    return null
  }

  setSELang(SToElang:Iterable<readonly [string, string]>) {
    this.SLangToELang = new Map(SToElang)
    //@ts-ignore
    this.ELangToSLang = new Map(SToElang.map(([a, b]) => [b, a]))
  }

  isChinese(text: string) {
    const re = /[\u4E00-\u9FA5]+/;
    if (re.test(text)) return true;
    return false;
  }

  getSLang(lang?:string) :string|undefined {
    if(!lang) return ''
    return this.ELangToSLang && this.ELangToSLang.get(lang)
  }

  getELang(lang?:string) :string|undefined  {
    if(!lang) return ''
    return this.SLangToELang && this.SLangToELang.get(lang)
  }

  checkELang(from:string, to:string, engine:string) :'__noSupportLang__'|'__onlyEnAndZh__'|'__onlyZhToZh__'|'' {
    if(this.LangSupport[engine].from[from] && this.LangSupport[engine].to[to]) {
      return ''
    }
    return this.LangSupport[engine].support
  }

  setExtraMsg(c:IContext, key:string, value:any) {
    const info:IWrapTransInfo = c.req
    if(!info.extraMsg) {
      info.extraMsg = new Map()
    }
    info.extraMsg.set(key, value)
  }

  setLangNotSupportResp(c:IContext , err:'__noSupportLang__'|'__onlyEnAndZh__'|'__onlyZhToZh__' = '__noSupportLang__') {
    c.resp = {
      errMsg: err,
      dialogMsg: {
        message: err,
        type: 'i18n'
      }
    }
    eventToGoogle({
      name: 'noSupportLang',
      params: {
        engine:c.req.engine,
        tLen: c.req.text.length,
        form: c.req.from,
        to: c.req.to,
        fromCp: c.req.fromCp,
        toCp: c.req.toCp
      }
    })
  }

  setDetectLangErrResp(c:IContext) {
    c.resp = {
      errMsg: 'transDetectLangErr',
      toastMsg: {
        message: '__reqErr__',
        type: 'i18n'
      }
    }
    eventToGoogle({
      name: 'detectLangReqErr',
      params: {
        engine:c.req.engine,
        tLen: c.req.text.length,
        form: c.req.from,
        to: c.req.to,
        fromCp: c.req.fromCp,
        toCp: c.req.toCp
      }
    })
  }

  transErrToAnalytic(c:IContext, resp: IResponse, other:any = {}) {
    const info:IWrapTransInfo = c.req
    const params = {
      from: info.from,
      to: info.to,
      type: info.type,
      textLenght: info.text.length,
      cost: info.cost,
      errMsg: `${info.engine}_${resp.status}`,
      transMode: info.mode,
      engine: info.engine,
      respErr: resp.errMsg,
    }
    other && (Object.assign(params, other))
    eventToGoogle({
      name: 'transErr',
      params
    })
  }

  transOKToAnalytic(c:IContext, resp: IResponse, other:any = {}) {
    const info:IWrapTransInfo = c.req
    const params = {
      from: info.from,
      to: info.to,
      type: info.type,
      tLen: info.text.length,
      cost: info.cost,
      transMode: info.mode,
      engine: info.engine,
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

  getCost(c:IContext) {
    c.req.cost = new Date().valueOf() - this.start
  }
}