import {BaseTrans} from '@/translator/share';
import {ITransResult, IWrapTransInfo} from '@/interface/trans';
import { Context } from '@/api/context';
import { IBaseResp, baseRequest } from '@/api/request';
import { LangSysToBing } from './trans_base';
import {wrapTranslator} from '@/translator/transWrap'

interface IExample {
    sourcePrefix:string
    sourceSuffix:string
    sourceTerm:string
    targetPrefix:string
    targetSuffix:string
    targetTerm:string
}

export class BingTrans extends BaseTrans {
    SLangToELang = new Map(LangSysToBing)
    //@ts-ignore
    ELangToSLang = new Map(LangSysToBing.map(([a, b]) => [b, a]))

    HOME_PAGE = 'https://cn.bing.com/translator'
    IG = ''
    key = ''
    token = ''
    IID:string|null|undefined = ''
    HOST = 'https://cn.bing.com/'
    count = 0
    HEADERS = {
        accept: "*/*",
        "accept-language": "en-US,zh-CN,zh-TW;q=0.9,zh;q=0.8,en;q=0.7",
        "content-type": "application/x-www-form-urlencoded",
    };

    test() :boolean {
        return true
    }

    async CTrans(c:Context) :Promise<Context> {
        const err = await this.setLangCode(c)
        if(err) {
            return c
        }

        if (await this.updateTokens(false)) {
            c.err = '__transReqErr__'
            c.dialogMsg = {
                message: '__transReqErr__',
                type: 'i18n'
            }
            return c
        }
        const isRetry = await this.trans(c, false)
        if (isRetry) {
            if (await this.updateTokens(true)) {
                c.err = '__transReqErr__'
                c.dialogMsg = {
                    message: '__transReqErr__',
                    type: 'i18n'
                }
            } else {
                await this.trans(c, true)
            }
        }

        if (!c.err) {
            this.transOKToAnalytic(c, c)
        } else {
            this.transErrToAnalytic(c, c)
        }

        return c
    }

    async trans(c:Context, isRetry:boolean) :Promise<boolean> {
        const info:IWrapTransInfo = c.req

        const translateURL = `ttranslatev3?isVertical=1&IG=${this.IG}&IID=${this.IID}.${this.count.toString()}`
        const translateData = `&fromLang=${info.fromCode}&to=${info.toCode}&text=${encodeURIComponent(c.req.text)}&token=${encodeURIComponent(this.token)}&key=${encodeURIComponent(this.key)}`;

        const resp = await baseRequest({
            url: this.HOST + translateURL + translateData,
            method: "post",
            headers: this.HEADERS,
        })
        if (resp.err) {
            c.err = '__transReqErr__'
            c.dialogMsg = {
                message: '__transReqErr__',
                type: 'i18n'
            }
            return false
        }

        try {
            c.res = this.parseResult(resp.data, c)
        } catch(e) {
            if (isRetry) {
                c.err = '__transReqErr__'
                c.dialogMsg = {
                    message: '__transReqErr__',
                    type: 'i18n'
                }
                console.log('bing trans err: ', e)
            } else {
                console.log('bing trans err need retry', e)
                return true
            }
        }

        if (info.type === 'sub') {
            try {
                await this.getTexamplev3(c, c.res.text)
            } catch(e) {
                console.log('bing getTexamplev3: ', info.text, e)
            }
        }

        return false
    }

    async getTexamplev3(c:Context, translation:string) {
        const info:IWrapTransInfo = c.req

        const url = `texamplev3?isVertical=1&IG=${this.IG}&IID=${this.IID}.${this.count.toString()}`
    
        const reqData = `&from=${info.fromCode}&to=${info.toCode}&text=${encodeURIComponent(info.text)}&translation=${encodeURIComponent(translation)}&token=${encodeURIComponent(this.token)}&key=${encodeURIComponent(this.key)}`

        const resp = await baseRequest({
            url: this.HOST + url + reqData,
            method: "post",
            headers: this.HEADERS,
        })
        if (resp.err) {
            c.err = '__transReqErr__'
            c.dialogMsg = {
                message: '__transReqErr__',
                type: 'i18n'
            }
            return false
        }

        const examples = resp.data[0].examples as IExample[];
        const res = c.res as ITransResult;
        res.examples = []
        examples.forEach((item) => {
            res.examples?.push({
                text: `${item.sourcePrefix}<b>${item.sourceTerm}</b>${item.sourceSuffix}`,
                trans: `${item.targetPrefix}<b>${item.targetTerm}</b>${item.targetSuffix}`,
            })
        })
    }

    parseResult(result:any, c:Context) :ITransResult {
        const transRes = result[0].translations[0]
        return {
            text: transRes.text,
            resultFrom: c.req.sFrom,
            resultTo: c.req.sTo,
            tPronunciation: transRes?.transliteration?.text,
            engine: c.req.engine,
            data: result,
            // sPronunciation: result.sPronunciation,
            // dict: result.dict,
            // examples: result.examples,
        }
    }

    async updateTokens(focus:boolean) :Promise<any> {
        if (!focus && this.IG) {
            return null
        }
        const resp = await baseRequest({
            url: this.HOME_PAGE,
            method: 'get',
        })
        if (resp.err) {
            return resp.err
        }
        const responseHost = /(https:\/\/.*\.bing\.com\/).*/g.exec(resp.httpResp.url);
        if (responseHost && responseHost[1] != this.HOST) {
            console.log('bing responseHost: ', responseHost[1])
            this.HOST = responseHost[1];
            this.HOME_PAGE = `${this.HOST}translator`;
        }

        this.IG = resp.data.match(/IG:"([A-Za-z0-9]+)"/)[1];

        [, this.key, this.token] = resp.data.match(
            /var params_AbusePreventionHelper\s*=\s*\[([0-9]+),\s*"([^"]+)",[^\]]*\];/
        );

        const regex = /<div id="rich_tta".*?data-iid="(.*?)"/;
        const match = resp.data.match(regex);
        this.IID = match ? match[1] : '';

        this.count = 0;
        return null
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
}