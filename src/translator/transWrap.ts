import {IWrapTransInfo, ITransResult, IRequestResult} from '@/utils/interface'
import {GoogleTrans} from '@/translator/google'
import {BaiduTrans} from '@/translator/baiduDomainTrans'
import {getMainLang, getSecondLang, getFromeStorage} from '@/utils/chromeApi'

class WrapTranslator {
    google: GoogleTrans
    baidu: BaiduTrans
    constructor() {
        this.google = new GoogleTrans()
        this.baidu = new BaiduTrans()
    }
    async trans(transInfo:IWrapTransInfo) :Promise<IRequestResult> {
        if (transInfo.from === '') {
            transInfo.from = 'auto'
        }
      
        if (transInfo.to === '' || transInfo.to === 'auto') {
        transInfo.to = await this.autoGetLang(transInfo.text, transInfo.from, transInfo.to)
        }

        if (!transInfo.engine) {
          const info = await getFromeStorage(['transEngine'])
          transInfo.engine = info.transEngine
        }
        const engineInfo = transInfo.engine ? transInfo.engine.split("__") : undefined
        if(!engineInfo) {
          return await this.google.trans(transInfo)
        }

        switch (engineInfo[0]) {
          case 'ggTrans':
            return await this.google.trans(transInfo)
          case 'bdTrans':
            return await this.baidu.transDomain(transInfo)
          case 'bdDM':
            return await this.baidu.transDomain(transInfo)
          default:
            return await this.google.trans(transInfo)
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