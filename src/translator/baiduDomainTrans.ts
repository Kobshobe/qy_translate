import {BaseTrans} from '@/translator/share'
import {IWrapTransInfo, ITransResult, IBDDMTransResult, IRequestResult} from '@/utils/interface'
import {baiduDomainTransApi} from '@/api/api'
import {languages, GToBaidu, baiduToG, checkLang, bdLangSupport} from '@/translator/language'

export class BaiduTrans extends BaseTrans {

    async transDomain({text, from, to, mode, type, engine}:IWrapTransInfo) :Promise<IRequestResult> {
        
        const toLongErr = this.checkTextLen(text)
        if(toLongErr) {
            return toLongErr
        }

        const engineInfo = engine.split('__')
        //@ts-ignore
        let baiduFrom = GToBaidu[from]
        //@ts-ignore
        const baiduTo = GToBaidu[to]
        if(!baiduFrom) {
            baiduFrom = 'auto'
        }

        const supportErr = checkLang(baiduFrom, baiduTo, engine, bdLangSupport)
        if(supportErr !== '') {
            return {
                errMsg: '',
                toastMsg: {
                    type: 'i18n',
                    message: supportErr
                }
            }
        }

        const resp = await baiduDomainTransApi({q:text,from:baiduFrom,to:baiduTo,domain:engineInfo[1]})
        
        if (resp.errMsg) {
            return {
                errMsg: ''
            }
        }

        console.log(resp)
    
        const data:ITransResult = {
            text: resp.data.result.reduce((total:string, item:string) => {total+=item}),
            //@ts-ignore
            resultFrom: baiduToG[resp.data.from],
            resultTo: to,
            engine: engine
        }

        return {
            errMsg:'',
            data
        }
    }
}

