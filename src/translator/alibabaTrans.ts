import {BaseTrans} from '@/translator/share'
import {SToAlibaba, alLangSupport} from '@/translator/trans_base'
import {IWrapTransInfo, ITransResult} from '@/interface/trans'
import {domainTransApi} from '@/api/api'
import {wrapTranslator} from '@/translator/transWrap'
import { Context } from '@/api/context'
import { IBaseResp } from '@/api/request'

export class AlibabaTrans extends BaseTrans {
    SLangToELang = new Map(SToAlibaba)
    //@ts-ignore
    ELangToSLang = new Map(SToAlibaba.map(([a, b]) => [b, a]))
    LangSupport = alLangSupport
    maxLenght = 1800

    async transDomain(c:Context) :Promise<Context> {
        const info:IWrapTransInfo = c.req
        const toLongErr = this.checkTextLen(c)
        if(toLongErr) {
            c.resp = toLongErr
            return c
        }

        // detect lang and set engine lang //marks
        const err = await this.setLangCode(c)

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
        const ctx = await domainTransApi(new Context({q:info.text,from:info.fromCode,to:info.toCode,domain:engineInfo[1], engine:'alibaba'}))
        
        if (ctx.err) {
            c.errDetail = ctx.errDetail
            if(ctx.err !== '__noRice__') {
                c.dialogMsg = ctx.dialogMsg
                c.toastMsg = ctx.toastMsg
                c.err = ctx.err
                this.transErrToAnalytic(c, ctx)
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
            text: ctx.res.result.reduce((total:string, item:string) => {total+=item}),
            resultFrom: this.getSLang(info.fromCode) as string,
            resultTo: this.getSLang(info.toCode) as string,
            engine: info.engine
        }

        this.transOKToAnalytic(c, ctx)
        

        c.res = data
        return c
    }

    async detectTextLang(c:Context) :Promise<IBaseResp> {
        const mookC = new Context({text: c.req.text})
        const resp = await wrapTranslator.baidu.detectTextLang(mookC)
        if(resp.err) {
            return resp
        }
        const lang = resp.res.lang
        const sLang = wrapTranslator.baidu.getSLang(lang)
        const eLang = this.getELang(sLang)
        resp.res = {lang: eLang}
        return resp
    }

    async changeEngine(c:Context) {
        const err = wrapTranslator.baidu.setELangsFromSlangs(c)
        if (err) {
            this.setLangNotSupportResp(c)
            return c
        }
        this.setExtraMsg(c, '__changeEngine__', c.req.engine)
        return await wrapTranslator.baidu.CTrans(c)
    }
}