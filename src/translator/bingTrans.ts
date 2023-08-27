import {BaseTrans} from '@/translator/share';
import {ITransResult} from '@/interface/trans';
import { Context } from '@/api/context';
import { baseRequest } from '@/api/request';

export class BingTrans extends BaseTrans {
    HOME_PAGE = 'https://cn.bing.com/translator'
    IG = ''
    key = ''
    token = ''
    IID:string|null|undefined = ''
    HOST = 'https://cn.bing.com/'
    count = '1'
    HEADERS = {
        accept: "*/*",
        "accept-language": "zh-CN,zh-TW;q=0.9,zh;q=0.8,en;q=0.7",
        "content-type": "application/x-www-form-urlencoded",
    };

    test() :boolean {
        return true
    }

    async CTrans(c:Context) :Promise<Context> {
        const resp = await baseRequest({
            url: this.HOME_PAGE,
            method: 'get',
        })
        console.log("bing1: ", resp)
        this.IG = resp.data.match(/IG:"([A-Za-z0-9]+)"/)[1];

        [, this.key, this.token] = resp.data.match(
            /var params_RichTranslateHelper\s*=\s*\[([0-9]+),\s*"([^"]+)",[^\]]*\];/
        );

        [,this.IID] = resp.data.match(/<div id="rich_tta" data-iid="(.+?)"/)

        this.trans("", "", "")
        // const dom = new JSDOM(resp.data);
        // this.IID = dom.window.document.getElementById('rich_tta')?.getAttribute('data-iid')
        // this.IID = html.getElementById("rich_tta")!.getAttribute("data-iid") || "";

        c.resp = {
            data: {
                text: 'text',
                resultFrom: c.req.sFrom,
                resultTo: c.req.sTo,
                engine: c.req.engine,
                data: {IG: this.IG}
            }
        }

        return c
    }

    async trans(text: string, from: string, to: string) {
        const translateURL = `ttranslatev3?isVertical=1&IG=${this.IG}&IID=${this.IID}.${this.count.toString()}`

        const translateData = `&fromLang=${'en'}&to=${'zh-Hans'}&text=${encodeURIComponent('app')}&token=${encodeURIComponent(this.token)}&key=${encodeURIComponent(this.key)}`;

        const resp = await baseRequest({
            url: this.HOST + translateURL + translateData,
            method: "post",
            headers: this.HEADERS,
        })
        console.log("bing:trams: ", resp)

        return {
            method: "POST",
            baseURL: this.HOST,
            url: translateURL,
            headers: this.HEADERS,
            // data: translateData,
        };
    }

    async getToken() {
        const resp = await baseRequest({
            url: this.HOME_PAGE,
            method: 'get',
        })
        this.IG = resp.data.match(/IG:"([A-Za-z0-9]+)"/)[1];

        [, this.key, this.token] = resp.data.match(
            /var params_RichTranslateHelper\s*=\s*\[([0-9]+),\s*"([^"]+)",[^\]]*\];/
        );

        [,this.IID] = resp.data.match(/<div id="rich_tta" data-iid="(.+?)"/)
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
}