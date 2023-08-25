import {BaseTrans} from '@/translator/share'
import {SToAlibaba, alLangSupport} from '@/translator/language'
import {IContext,IWrapTransInfo, ITransResult, IBDDMTransResult, IResponse, IToastMsg, IDialogMsg} from '@/interface/trans'
import {domainTransApi, baseFetch} from '@/api/api'
import {wrapTranslator} from '@/translator/transWrap'

export class AlibabaTrans extends BaseTrans {
    SLangToELang = new Map(SToAlibaba)
    //@ts-ignore
    ELangToSLang = new Map(SToAlibaba.map(([a, b]) => [b, a]))
    LangSupport = alLangSupport
    maxLenght = 1800

    async transDomain(c:IContext) :Promise<IContext> {
        const info:IWrapTransInfo = c.req
        const toLongErr = this.checkTextLen(c)
        if(toLongErr) {
            c.resp = toLongErr
            return c
        }

        // detect lang and set engine lang //marks
        let err = await this.setLangCode(c)

        if (err) {
            return c
        }

        if (!info.engine) return c

        const engineInfo = info.engine.split('__') as string[];

        if (engineInfo[1] === 'common') {
            this.setLangNotSupportResp(c)
            return c
        }

        //@ts-ignore true to common domain and give tips
        const supportErr = this.checkDMLang(info.fromCode, info.toCode, info.engine)
        if(supportErr !== '') {
            this.setExtraMsg(c, 'tipsMessages', [supportErr, '__changeEngineForLang__']);
            return this.changeEngine(c)
        }

        this.startTiming()
        const resp = await domainTransApi({q:info.text,from:info.fromCode,to:info.toCode,domain:engineInfo[1], engine:'alibaba'})
        
        if (resp.errMsg) {
            if(resp.errMsg !== '__noRice__') {
                this.transErrToAnalytic(c, resp)
                c.resp = resp
                return c
            }
            this.setExtraMsg(c, '__noRice__', {
                message: "__wantToApplyTrans__",
                confirmText: '__applyServiceFree__',
                type: 'i18n'
            })
            return this.changeEngine(c)
        }

        this.getCost(c)
        const data:ITransResult = {
            text: resp.resData.result.reduce((total:string, item:string) => {total+=item}),
            resultFrom: this.getSLang(info.fromCode) as string,
            resultTo: this.getSLang(info.toCode) as string,
            engine: info.engine
        }

        this.transOKToAnalytic(c, resp)
        

        c.resp = {
            errMsg:'',
            data
        }
        return c
    }

    async detect(c:IContext) :Promise<IContext> {
        const mookC:IContext = {
            req: {
                text: c.req.text
            },
        }
        await wrapTranslator.baidu.detect(mookC)
        if(!mookC.resp) {
            return c
        }
        if(mookC.resp.errMsg) {
            c.resp = mookC.resp
            return c
        }
        const lang = mookC.resp.data.langdetected
        const sLang = wrapTranslator.baidu.getSLang(lang)
        const eLang = this.getELang(sLang)
        mookC.resp.data.langdetected = eLang
        c.resp = mookC.resp
        return c
    }

    async changeEngine(c:IContext) {
        const err = wrapTranslator.baidu.setELangsFromSlangs(c)
        if (err) {
            this.setLangNotSupportResp(c)
            return c
        }
        this.setExtraMsg(c, '__changeEngine__', c.req.engine)
        return await wrapTranslator.baidu.CTrans(c)
    }
}