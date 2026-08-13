import {BaseTrans} from '@/translator/share';
import {ITransResult, IWrapTransInfo} from '@/interface/trans';
import { Context } from '@/api/context';
import { IBaseResp, baseRequest } from '@/api/request';
import { LangSysToBing } from './trans_base';
import {wrapTranslator} from '@/translator/transWrap'
import splitLongText from '@/translator/splitLongText'

/** Max text length per single Bing request. Bing truncates input beyond ~1000 chars. */
export const BING_MAX_REQ_TEXT = 1000

/** CJK punctuation used as chunk split points (Chinese/Japanese/Korean text has no spaces). */
export const BING_SPLIT_PUNCT = '。，！？；：、“”‘’（）《》【】…—·'

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
        // Bing silently truncates input beyond ~1000 chars per request, so long
        // text must be split into chunks and translated one by one.
        if (c.req.text.length > BING_MAX_REQ_TEXT) {
            return this.transChunks(c, isRetry)
        }

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

    /**
     * Translate long text (> BING_MAX_REQ_TEXT) in chunks and join the results.
     * Chunks are cut at punctuation/whitespace boundaries so words are never
     * split mid-way. Returns true when the caller should retry with fresh tokens.
     */
    private async transChunks(c:Context, isRetry:boolean) :Promise<boolean> {
        const info:IWrapTransInfo = c.req

        // Split at sentence/word boundaries; fall back to hard slicing when a
        // single token is longer than the per-request limit.
        let chunks: string[]
        try {
            chunks = splitLongText(info.text, {
                maxLength: BING_MAX_REQ_TEXT,
                splitPunct: BING_SPLIT_PUNCT,
            })
        } catch(e) {
            console.log('bing splitLongText err: ', e)
            chunks = []
            for (let i = 0; i < info.text.length; i += BING_MAX_REQ_TEXT) {
                chunks.push(info.text.slice(i, i + BING_MAX_REQ_TEXT))
            }
        }

        let translated = ''
        let firstRes: ITransResult | null = null
        let lastRes: ITransResult | null = null
        for (const chunk of chunks) {
            const needRetry = await this.transOnce(c, isRetry, chunk)
            if (needRetry) return true
            if (c.err) return false
            const res = c.res as ITransResult
            firstRes || (firstRes = res)
            lastRes = res
            translated += res.text
        }

        // Merge chunk results into a single result for the caller.
        c.res = {
            text: translated,
            resultFrom: firstRes?.resultFrom,
            resultTo: firstRes?.resultTo,
            tPronunciation: firstRes?.tPronunciation,
            engine: info.engine,
            data: lastRes?.data,
        }
        return false
    }

    /** Translate one chunk (≤ BING_MAX_REQ_TEXT) as a single Bing request. */
    private async transOnce(c:Context, isRetry:boolean, text:string) :Promise<boolean> {
        const info:IWrapTransInfo = c.req

        const translateURL = `ttranslatev3?isVertical=1&IG=${this.IG}&IID=${this.IID}.${this.count.toString()}`
        const translateData = `&fromLang=${info.fromCode}&to=${info.toCode}&text=${encodeURIComponent(text)}&token=${encodeURIComponent(this.token)}&key=${encodeURIComponent(this.key)}`;

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