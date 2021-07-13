import {IContext, IWrapTransInfo, ITransResult, IResponse} from '@/utils/interface'
import {GoogleTrans} from '@/translator/google'
import {BaiduTrans} from '@/translator/baiduTrans'
import {getFromeStorage} from '@/utils/chromeApi'
import {Mode} from '@/config'

class WrapTranslator {
    google: GoogleTrans
    baidu: BaiduTrans
    lastTrans = 0

    constructor() {
        this.google = new GoogleTrans()
        this.baidu = new BaiduTrans()
    }

    async trans(c:IContext) :Promise<IContext> {
      const info: IWrapTransInfo = c.req
      const now = new Date().valueOf();
      
      // check frequency want menu trans
      if(info.type === 'menu') {
        const now = new Date().valueOf();
        if (now - this.lastTrans < 200) {
          this.lastTrans = now
          return c
        }
        this.lastTrans = now
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
    
}

export const wrapTranslator = new WrapTranslator()