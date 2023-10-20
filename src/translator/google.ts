import {BaseTrans} from '@/translator/share'
import {SToGoogle} from '@/translator/trans_base'
import {ITransResult,IWrapTransInfo} from '@/interface/trans'
import {calcHash} from '@/translator/tk'
import {baseRequest} from '@/api/request'
import {Context} from '@/api/context'
import {wrapTranslator} from '@/translator/transWrap'
import { IBaseResp } from '@/api/request'

class TkAndClient {
  // edge ttk: 434217.1534559001
  ttkList = ["434217.1534559001", "444444.1050258596", "445678.1618007056", "445767.3058494238", "444000.1270171236", "445111.1710346305"]

  client = "gtx"
  ttk: string = "434217.1534559001"
  getTk(text:string) {

    return '&client=' + this.client + '&tk=' + calcHash(text, this.ttk)
  }
  next() {
    this.client = (this.client === 'webapp' && 'gtx') || 'webapp'
    const index = this.ttkList.indexOf(this.ttk)
    if(index >= this.ttkList.length -1) {
      this.ttk = this.ttkList[0]
    } else {
      this.ttk = this.ttkList[index+1]
    }
  }
}

export class GoogleTrans extends BaseTrans {
  tkTool = new TkAndClient()
  HOST = 'https://translate.googleapis.com/translate_a/single'

  constructor() {
    super()
    this.maxLenght = 5000
    this.setSELang(SToGoogle)
  }

  getParamsUrlPart(data:Object) :string {
    return Object.keys(data).map(function (key) {
      //@ts-ignore
      return encodeURIComponent(key) + "=" + encodeURIComponent(data[key])
    }).join("&")
  }

  async trans(c:Context) :Promise<Context> {
    const info:IWrapTransInfo = c.req

    const tooLongErr = this.checkTextLen(c)
    if(c.err) {
      return c
    }

    const err = await this.setLangCode(c)
    if (err) return c

    /*
    [dt代表]
    t: 带翻译译文sentences
    rm: 会有音标加在sentences列表最后
    at: 使用频率alternative_translations
    bd: 词性与多词义dict
    md: definitions of source text, if it's one word
    ss:同义词synsets
    ex:例句examples.example
    rw: 
    dj: 
    qc: 
    ld: 
    */

    const dtPramas = info.type === 'sub' ? 'dt=rm&dt=ex&dt=bd&' : 'dt=rm&'
    
    //@ts-ignore
    const paramsData = new URLSearchParams({
      client: this.tkTool.client,
      source: 'input',
      hl: 'en-US',
      sl: info.fromCode,
      tl: info.toCode,
      dj: '1',
      q: info.text,
      dt: 't',
    })

    const realUrl = this.HOST + '?' + dtPramas + paramsData.toString() + this.tkTool.getTk(info.text)
    const start = new Date().getTime()

    const resp = await this.oneTrans(info, realUrl, 30000)
    
    if(resp.statusCode !== 200) {
      c.err = "__reqErr__"
      c.dialogMsg = {
        type: 'i18n',
        message: '__transReqErr__'
      }
      this.tkTool.next()
      // this.transErrToAnalytic(c, resp) todo
      return c
    }

    if (!c.err) {
        this.transOKToAnalytic(c, c)
    } else {
        this.transErrToAnalytic(c, c)
    }
    
    const result:ITransResult = {
      text: '',
      resultFrom: resp.data.src,
      //@ts-ignore
      resultTo: info.toCode,
      sPronunciation: '',
      tPronunciation: '',
      data: resp.data,
      engine: 'ggTrans__common'
    }

    resp.data.sentences.slice(0, -1).forEach((s:any) => {
      result.text += s.trans
    })
    result.sPronunciation = resp.data.sentences.slice(-1)[0].src_translit
    result.tPronunciation = resp.data.sentences.slice(-1)[0].translit
    result.examples = resp.data.examples && resp.data.examples.example;
    if (result.data.dict) {
      result.dict = []
      result.data.dict.forEach((item:any) => {
        //@ts-ignore
        result.dict.push({
          pos: item.pos,
          trans: item.terms.toString()
        })
      })
    }

    // this.transOKToAnalytic(c, resp) todo
    c.res = result
    return c
  }

  async oneTrans(info:IWrapTransInfo, url:string, timeout:number) :Promise<IBaseResp> {
    const start = new Date().getTime()

    const resp = await baseRequest({
      url: url,
      method: 'GET',
      timeout,
    });

    info.cost !== undefined || (info.cost = 0);
    info.cost = info.cost + new Date().valueOf() - start

    return resp
  }

  async detectTextLang(c:Context) :Promise<IBaseResp> {
    const mookC = new Context({text: c.req.text})
    const resp = await wrapTranslator.baidu.detectTextLang(mookC)
    if(resp.err) {
        c.err = resp.err
        return resp
    }
    const lang = resp.res.lang
    const sLang = wrapTranslator.baidu.getSLang(lang)
    const eLang = this.getELang(sLang)
    resp.res = {lang: eLang}
    return resp
  }

}

const langCharRange = {
  "zh-Cn": /[\u4E00-\u9FA5]+/,
  en: /[\u0041-\u005A]/,

}

/*
 async getParamsFromBaseUrl(): Promise<boolean> {
    const response = await fetch(this.baseUrl, {
      method: 'GET',
      mode: 'cors',
    })
    if (response.status === 200) {
      const bodyText = await response.text()
      this.fSid = this.extract('FdrFJe', bodyText)
      this.bl = this.extract('cfb2h', bodyText)
      this.fSidSaveTime = new Date()
      return true
    } else {
      return false
    }
  }

  async getTransParams(): Promise<boolean> {
    // console.log('getTransParams')
    const now = new Date()
    const pass = now.getTime() - this.fSidSaveTime.getTime()
    if (this.fSid === undefined || this.bl === undefined || pass > 40200000) {
      // console.log("init trans params")
      return await this.getParamsFromBaseUrl()
    }

    if (pass > 28800000) {
      // console.log("update trans params")
      new Promise(async (resolve, _) => {
        await this.getParamsFromBaseUrl()
      })

    }
    return true
  }


  async find(text: string, from: string = '', to: string = ''): Promise<any> {
    await this.getTransParams()

    if (from === '') {
      from = 'auto'
    }

    if (to === '' || to === 'auto') {
      if (this.isChinese(text)) {
        to = "en"
      }
    }

    const data = {
      'rpcids': 'MkEWBc',
      'f.sid': this.fSid,
      'bl': this.bl,
      'hl': 'zh-CN',
      'soc-app': 1,
      'soc-platform': 1,
      'soc-device': 1,
      '_reqid': Math.floor(1000 + (Math.random() * 9000)),
      'rt': 'c'
    }
    // console.log(data)
    const params = Object.keys(data).map(function (key) {
      //@ts-ignore
      return encodeURIComponent(key) + "=" + encodeURIComponent(data[key])
    }).join("&")

    const body = 'f.req=' + encodeURIComponent(JSON.stringify([[['MkEWBc', JSON.stringify([[text, from, to, true], [null]]), null, 'generic']]])) + '&';

    const findResult = await fetch(this.baseUrl + "/_/TranslateWebserverUi/data/batchexecute?" + params, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      mode: 'cors',
      body: body
    })
    if (findResult.status !== 200) {
      return false
    }
    let json: any = await findResult.text()
    json = json.slice(6)
    //   console.log(json)

    let length = '';

    const result = {
      text: '',
      pronunciation: '',
      resultFrom: undefined,
      resultTo: undefined,
      from: {
        language: {
          didYouMean: false,
          iso: ''
        },
        text: {
          autoCorrected: false,
          value: '',
          didYouMean: false
        }
      },
      raw: ''
    }

    try {
      //@ts-ignore
      length = /^\d+/.exec(json)[0];
      // console.log("length: ", length)
      json = JSON.parse(json.slice(length.length, parseInt(length, 10) + length.length));
      json = JSON.parse(json[0][2]);
      // console.log(json)
      result.raw = json;
    } catch (e) {
      // console.log('catch', e, result)
      return false;
    }

    if (json[1][0][0][5] === undefined || json[1][0][0][5] === null) {
      // translation not found, could be a hyperlink or gender-specific translation?
      result.text = json[1][0][0][0];
    } else {
      //@ts-ignore
      json[1][0][0][5].forEach(function (obj) {
        if (obj[0]) {
          result.text += obj[0];
        }
      });
    }
    result.pronunciation = json[1][0][0][1];
    //@ts-ignore
    result.resultFrom = result.raw[0][2]
    if (result.resultFrom === null) {
      //@ts-ignore
      result.resultFrom = result.raw[1][3]
    }
    if (result.resultFrom === null) {
      // console.log(json)
    }
    //@ts-ignore
    result.resultTo = result.raw[1][1]

    // console.log(result)
    return result

  }

  extract(key: string, body: string) {
    const re = new RegExp(`"${key}":".*?"`);
    const result = re.exec(body);
    if (result !== null) {
      return result[0].replace(`"${key}":"`, '').slice(0, -1);
    }
    return '';
  }
*/