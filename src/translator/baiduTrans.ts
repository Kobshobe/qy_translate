import {BaseTrans} from '@/translator/share'
import {IWrapTransInfo, ITransResult} from '@/interface/trans'
import {domainTransApi} from '@/api/api'
import {SToBaidu, bdLangSupport} from '@/translator/language'
import { Context } from '@/api/context'
import { baseRequest, IBaseResp } from '@/api/request'

export class BaiduTrans extends BaseTrans {
    SLangToELang = new Map(SToBaidu)
    //@ts-ignore
    ELangToSLang = new Map(SToBaidu.map(([a, b]) => [b, a]))
    LangSupport = bdLangSupport
    maxLenght = 1800

    CHOST: string = 'https://fanyi.baidu.com/'
    CTOKEN: string = ''
    CGTK: string = ''
    CHEADERS: any = {
        accept: "*/*",
        "accept-language": "en,zh;q=0.9,en-GB;q=0.8,en-CA;q=0.7,en-AU;q=0.6,en-ZA;q=0.5,en-NZ;q=0.4,en-IN;q=0.3,zh-CN;q=0.2",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    };

    //百度专业翻译
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
            return await this.CTrans(c)
        }

        //@ts-ignore true to common domain and give tips
        const supportErr = this.checkDMLang(info.fromCode, info.toCode, info.engine)
        if(supportErr !== '') {
            this.setExtraMsg(c, 'tipsMessages', [supportErr, '__changeEngineForLang__']);
            this.setExtraMsg(c, '__changeEngine__', info.engine)
            return await this.CTrans(c)
        }

        this.startTiming()
        const ctx = await domainTransApi(new Context({q:info.text,from:info.fromCode,to:info.toCode,domain:engineInfo[1], engine:'baidu'}))
        
        if (ctx.err) {
            if(ctx.err !== '__noRice__') {
                c.err = ctx.err
                c.dialogMsg = ctx.dialogMsg
                c.toastMsg = ctx.toastMsg
                this.transErrToAnalytic(c, ctx)
                return c
            }
            this.setExtraMsg(c, '__noRice__', {
                message: "__wantToApplyTrans__",
                confirmText: '__applyServiceFree__',
                type: 'i18n'
            })
            this.setExtraMsg(c, '__changeEngine__', info.engine)
            return await this.CTrans(c)
        }

        this.getCost(c)
        const data:ITransResult = {
            text: ctx.res.result.reduce((total:string, item:string) => {total+=item}),
            resultFrom: info.sFrom as string,
            resultTo: info.sTo as string,
            engine: info.engine
        }

        this.transOKToAnalytic(c, ctx)
        

        c.res = data
        return c
    }

    //百度通用翻译
    async CTrans(c:Context) :Promise<Context> {
        const info:IWrapTransInfo = c.req
        info.engine = 'bdTrans__common'
        let tipsMessages = []
        let dialogMsg = undefined

        if (info.extraMsg) {
            if(info.extraMsg.get('__noRice__')) {
                dialogMsg = info.extraMsg.get('__noRice__')
            }
            if(info.extraMsg.has('tipsMessages')) {
                tipsMessages = info.extraMsg.get('tipsMessages')
            }
        }

        if (!info.isDetectedLang) {
            const err = await this.setLangCode(c)
            if(err) {
                return c
            }
        }

        const trans:any = async () :Promise<IBaseResp> => {
            this.startTiming()
            const resp = await baseRequest({
                url: `${this.CHOST}/v2transapi`,
                method: "POST",
                headers: this.CHEADERS,
                query: {
                    from: info.fromCode,
                    to: info.toCode,
                    query: info.text,
                    transtype: "realtime",
                    simple_means_flag: 3,
                    sign: this.generateSign(info.text, this.CGTK),
                    token: this.CTOKEN,
                    domain: "common",
                }
            });

            if (!resp.data.errno) {
                resp.res = {data: this.parse(this.parseResult(resp.data), c)}
                return resp
            }
            await this.getTokenGtk();
            resp.err = '__transReqErr__'
            c.err = resp.err
            c.dialogMsg = {
                message: '__transReqErr__',
                type: 'i18n'
            }
            return resp
        };

        if (!(this.CTOKEN && this.CGTK)) {
            await this.getTokenGtk();
        }

        let resp:any = await trans();

        if(resp.err) {
            await this.getTokenGtk();
            resp = await trans()
        }

        this.getCost(c)
        c.tipsMessages = tipsMessages
        c.dialogMsg = dialogMsg

        if (!resp.errMsg) {
            this.transOKToAnalytic(c, resp)
        } else {
            this.transErrToAnalytic(c, resp)
        }

        c.res = resp.res.data
        
        return c
    }

    generateSign(query:any, gtk:any) {
        var C = null;
        var o = query.length;
        o > 30 &&
            (query =
                "" +
                query.substr(0, 10) +
                query.substr(Math.floor(o / 2) - 5, 10) +
                query.substring(query.length, query.length - 10));
        var t = void 0,
        //@ts-ignore
            t = null !== C ? C : (C = gtk || "") || "";
        for (
            //@ts-ignore
            var e = t.split("."),
                h = Number(e[0]) || 0,
                i = Number(e[1]) || 0,
                d = [],
                f = 0,
                g = 0;
            g < query.length;
            g++
        ) {
            var m = query.charCodeAt(g);
            128 > m
                ? (d[f++] = m)
                : (2048 > m
                      ? (d[f++] = (m >> 6) | 192)
                      : (55296 === (64512 & m) &&
                        g + 1 < query.length &&
                        56320 === (64512 & query.charCodeAt(g + 1))
                            ? ((m = 65536 + ((1023 & m) << 10) + (1023 & query.charCodeAt(++g))),
                              (d[f++] = (m >> 18) | 240),
                              (d[f++] = ((m >> 12) & 63) | 128))
                            : (d[f++] = (m >> 12) | 224),
                        (d[f++] = ((m >> 6) & 63) | 128)),
                  (d[f++] = (63 & m) | 128));
        }
        for (var S = h, u = "+-a^+6", l = "+-3^+b+-f", s = 0; s < d.length; s++)
            (S += d[s]), (S = this.tokenA(S, u));
        return (
            (S = this.tokenA(S, l)),
            (S ^= i),
            0 > S && (S = (2147483647 & S) + 2147483648),
            (S %= 1e6),
            S.toString() + "." + (S ^ h)
        );
    }

    tokenA(r:any, o:any) {
        for (var t = 0; t < o.length - 2; t += 3) {
            var a = o.charAt(t + 2);
            (a = a >= "a" ? a.charCodeAt(0) - 87 : Number(a)),
                (a = "+" === o.charAt(t + 1) ? r >>> a : r << a),
                (r = "+" === o.charAt(t) ? (r + a) & 4294967295 : r ^ a);
        }
        return r;
    }

    async detectTextLang(c:Context) :Promise<IBaseResp> {
        const oneDetect = async () => {
            return await baseRequest({
                method: "post",
                url: this.CHOST+"langdetect",
                headers: this.CHEADERS,
                query: {
                    query: c.req.text.slice(0,150),
                },
                timeout: 20000
            });
        }

        const resp = await oneDetect()
        if (!resp.err) {
            if (resp.data?.errno || resp.data.msg != 'success') {
                resp.err = resp.data?.errmsg ? resp.data?.errmsg:'__unknown__'
            } else {
                resp.res = {lang: resp.data.lan}
            }
        }

        return resp
    }

    async getTokenGtk() {
        const oneRequest = async () => {
            const resp = await baseRequest({
                method: "get",
                url: this.CHOST,
            });

            this.CTOKEN = resp.data.match(/token: '(.*?)',/)[1];
            this.CGTK = resp.data.match(/window.gtk = "(.*?)"/)[1];
        };

        // request two times to ensure the token is the latest value
        // otherwise the request would return "997" error
        await oneRequest();
        // await oneRequest();
    }

    parse(result:any, c:Context) :ITransResult {
        return {
            text: result.mainMeaning,
            resultFrom: c.req.sFrom,
            resultTo: c.req.sTo,
            sPronunciation: result.sPronunciation,
            tPronunciation: result.tPronunciation,
            dict: result.dict,
            examples: result.examples,
            engine: c.req.engine,
            data: result
        }
    }

    parseResult(result:any) {
        const parsed = {} as any;
        const originalTexts = [],
            mainMeanings = [];
        for (const item of result.trans_result.data) {
            originalTexts.push(item.src);
            mainMeanings.push(item.dst);
        }

        parsed.originalText = originalTexts.join("\n");
        parsed.mainMeaning = mainMeanings.join("\n");
        

        if (result.trans_result.phonetic) {
            parsed.tPronunciation = result.trans_result.phonetic
                .map((e:any) => (e.trg_str !== " " ? e.trg_str : e.src_str))
                .reduce((t1:any, t2:any) => `${t1} ${t2}`); // get the result by splicing the array
        }

        // japanese target pronunciation
        if (result.trans_result.jp_pinyin) {
            //@ts-ignore
            parsed.tPronunciation = result.trans_result.jp_pinyin[0].dst;
        }

        // dictionary is not in the result
        if (result.dict_result) {
            if (result.dict_result.simple_means) {
                parsed.sPronunciation = result.dict_result.simple_means.symbols[0].ph_en;
                parsed.dict = [];

                // Parse one detailed meaning.
                const appendDetailedMeaning = (part:any) => {
                    const meaning = {};
                    //@ts-ignore
                    meaning.pos = part.part; // part of speech
                    //@ts-ignore
                    meaning.trans = part.means.reduce(
                        //@ts-ignore
                        (meaning1, meaning2) => `${meaning1}, ${meaning2}`
                    );
                    //@ts-ignore
                    parsed.dict.push(meaning);
                };

                for (const part of result.dict_result.simple_means.symbols[0].parts) {
                    if (part.part) {
                        appendDetailedMeaning(part);
                        continue;
                    }

                    for (const mean of part.means) {
                        if (!mean.means) continue;
                        appendDetailedMeaning(mean);
                    }
                }
            }

            if (result.dict_result.edict) {
                //@ts-ignore
                parsed.definitions = [];
                // iterate pos
                for (const item of result.dict_result.edict.item) {
                    // iterate meaning of each pos
                    for (const tr of item.tr_group) {
                        const dict = {} as any;
                        dict.pos = item.pos;
                        dict.trans = tr.tr[0];
                        dict.example = tr.example[0];
                        dict.synonyms = tr.similar_word;
                        parsed.definitions.push(dict);
                    }
                }
            }

            if (result.dict_result.content) {
                parsed.sPronunciation = result.dict_result.voice[0].en_phonic;
                if (!parsed.detailedMeanings) parsed.detailedMeanings = [];
                for (const item of result.dict_result.content[0].mean) {
                    const meaning = {} as any;
                    meaning.pos = item.pre;
                    meaning.trans = Object.keys(item.cont)[0];
                    parsed.detailedMeanings.push(meaning);
                }
            }
        }

        if (result.liju_result.double) {
            parsed.examples = [];
            let examples = result.liju_result.double;
            examples = JSON.parse(examples);
            for (const sentence of examples) {
                const example = {} as any;

                // source language examples
                example.text = sentence[0]
                    .map((a:any) => {
                        if (a.length > 4) return a[0] + a[4];
                        return a[0];
                    })
                    .reduce((a1:any, a2:any) => a1 + a2);

                // target language examples
                example.trans = sentence[1]
                    .map((a:any) => {
                        if (a.length > 4) return a[0] + a[4];
                        return a[0];
                    })
                    .reduce((a1:any, a2:any) => a1 + a2);

                parsed.examples.push(example);
            }
        }
        return parsed;
    }

    //生成百度语音播放链接
    getTTSSrc(lang:string, text:string) :string {
        const eLang = this.getELang(lang)
        return `https://fanyi.baidu.com/gettts?lan=${eLang}&text=${text}&spd=4&source=web`
    }
}