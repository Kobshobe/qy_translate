import {IRequestResult,IWrapTransInfo} from '@/utils/interface'
import {getMainLang, getSecondLang, getFromeStorage} from '@/utils/chromeApi'
import { languages } from './language'

export class BaseTrans {
  maxLenght: number = 2000
  SLangToELang?: Map<string, string>
  ELangToSLang?: Map<string, string>
  LangSupport: any

  async setLangCode(info:IWrapTransInfo) {
    const langs = await getFromeStorage(['mainLang', 'secondLang'])
    langs.mainLang || (langs.mainLang = 'en');
    langs.secondLang || (langs.secondLang = 'en');

    if (info.from === '' || info.from === 'auto') {
      info.fromCode = await this.detect(info.text)
      info.from = this.getSLang(info.fromCode)
    } else {
      info.fromCode = this.getELang(info.from)
    }

    if(info.to) {
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
  }

  async detect(text:string) :Promise<any> {
  }

  async getStorageLang() {
    return await getFromeStorage(['mainLang', 'secondLang'])
  }
  
  checkTextLen(text:string) :IRequestResult|null {
    if(text.length > this.maxLenght) {
      return {
        errMsg: 'textTooLong',
        toastMsg: {
            type: 'i18n',
            message: '__textTooLong__'
      }
    }
    }
    return null
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

  noSupportLang(err:'__noSupportLang__'|'__onlyEnAndZh__'|'__onlyZhToZh__' = '__noSupportLang__') :IRequestResult {
    return {
      errMsg: err,
      dialogMsg: {
        message: err,
        type: 'i18n'
      }
    }
  }
}