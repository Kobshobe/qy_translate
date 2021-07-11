import {IContext, IWrapTransInfo, ITransResult, IResponse} from '@/utils/interface'
import {GoogleTrans} from '@/translator/google'
import {BaiduTrans} from '@/translator/baiduTrans'
import {getMainLang, getSecondLang, getFromeStorage} from '@/utils/chromeApi'
import {Mode} from '@/config'

class WrapTranslator {
    google: GoogleTrans
    baidu: BaiduTrans
    lastTrans = new Date().valueOf()

    constructor() {
        this.google = new GoogleTrans()
        this.baidu = new BaiduTrans()
    }

    async trans(c:IContext) :Promise<IContext> {
      console.log(c.req)
      const info: IWrapTransInfo = c.req
      const now = new Date().valueOf();
      
      if(Mode !== 'jest' && now - this.lastTrans < 300) {
        this.lastTrans = now
        return c
      }
      
      this.lastTrans = now;
      
      if (!info.engine) {
        const conf = await getFromeStorage(['transEngine'])
        info.engine = conf.transEngine
      }
      
      const engineInfo = info.engine ? info.engine.split("__") : undefined
      if(!engineInfo) {
        return await this.google.trans(c)
      }

      switch (engineInfo[0]) {
        case 'ggTrans':
          return await this.google.trans(c)
        case 'bdTrans':
          return await this.baidu.CTrans(c)
        case 'bdDM':
          return await this.baidu.transDomain(c)
        default:
          return await this.google.trans(c)
      }
    }

    isChinese(text: string) {
        const re = /[\u4E00-\u9FA5]+/;
        if (re.test(text)) return true;
        return false;
      }
    
      async autoGetLang(text:string, from:string, to:string) :Promise<string> {
    
        return await this.detectLang(text)
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
}

export const wrapTranslator = new WrapTranslator()