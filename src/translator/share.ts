import {IContext,IResponse,IWrapTransInfo} from '@/utils/interface'
import {getMainLang, getSecondLang, getFromeStorage} from '@/utils/chromeApi'
import {eventToGoogle} from '@/utils/analytics'
import { languages } from './language'

export class BaseTrans {
  maxLenght: number = 2000
  SLangToELang?: Map<string, string>
  ELangToSLang?: Map<string, string>
  LangSupport: any
  start = 0

  async setLangCode(c:IContext) :Promise<boolean> {
    const info:IWrapTransInfo = c.req
    info.fromCp = info.from
    info.toCp = info.to
    const langs = await getFromeStorage(['mainLang', 'secondLang'])
    langs.mainLang || (langs.mainLang = 'en');
    langs.secondLang || (langs.secondLang = 'en');

    if (!info.from || info.from === 'auto') {
      info.fromCode = await this.detect(c)
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
    if(!info.fromCode || !info.toCode) {
      eventToGoogle({
        name: 'transErrLang',
        params: {
          engine:info.engine,
          tLen: info.text.length,
          form: info.from,
          to: info.to,
          fromCp: info.fromCp,
          toCp: info.toCp
        }
      })
      return false
    } else {
      return true
    }
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

  async detectLang(text:string) {
    const mainLang = await getMainLang()
    if(mainLang === 'zh-CN') {
      if (this.isChinese(text)) {
        return await getSecondLang()
      } else {
        return await getMainLang()
      }
    }
    return await getMainLang()
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

  noSupportLang(c:IContext , err:'__noSupportLang__'|'__onlyEnAndZh__'|'__onlyZhToZh__' = '__noSupportLang__') {
    c.resp = {
      errMsg: err,
      dialogMsg: {
        message: err,
        type: 'i18n'
      }
    }
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