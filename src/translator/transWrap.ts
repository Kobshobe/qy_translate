import {IWrapTransInfo} from '@/interface/trans'
import {BaiduTrans} from '@/translator/baiduTrans'
import {BingTrans} from '@/translator/bingTrans'
import {getFromeStorage} from '@/utils/chromeApi'
import {Context} from '@/api/context'
import { GoogleTrans } from './google'
import { LLMTrans } from './llmTrans'

class WrapTranslator {
    baidu: BaiduTrans
    bing: BingTrans
    google: GoogleTrans
    llm: LLMTrans
    lastTrans = 0

    constructor() {
        this.baidu = new BaiduTrans()
        this.bing = new BingTrans()
        this.google = new GoogleTrans()
        this.llm = new LLMTrans()
    }

    async trans(c:Context) :Promise<Context> {
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
        info.engine || (info.engine = 'ggTrans__common')
      }
      
      const engineInfo = info.engine ? info.engine.split("__") : undefined
      if(!engineInfo) {
        debugger
        return await this.baidu.CTrans(c)
      }

      switch (engineInfo[0]) {
        case 'bing':
          return await this.bing.CTrans(c)
        case 'ggTrans':
          return this.google.trans(c)
        case 'llm':
          return await this.llm.CTrans(c)
        default:
          return await this.baidu.CTrans(c)
      }
    }

    isChinese(text: string) {
      const re = /[\u4E00-\u9FA5]+/;
      if (re.test(text)) return true;
      return false;
    }
    
}

export const wrapTranslator = new WrapTranslator()