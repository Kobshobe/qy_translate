import {BaseTrans} from '@/translator/share'
import { getMainLang, getSecondLang } from '@/utils/chromeApi'
import {IRequestResult, ITransResult, ITransResultFromApi,IWrapTransInfo} from '@/utils/interface'
import {eventToGoogle, getTextLimit} from '@/utils/analytics'
import {calcHash} from '@/translator/tk'

class TkAndClient {
  ttkList = ["444444.1050258596", "445678.1618007056", "445767.3058494238", "444000.1270171236", "445111.1710346305"]

  client = "webapp"
  ttk: string = "444444.1050258596"
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

  constructor() {
    super()
    this.maxLenght = 5000
  }

  getParamsUrlPart(data:Object) :string {
    return Object.keys(data).map(function (key) {
      //@ts-ignore
      return encodeURIComponent(key) + "=" + encodeURIComponent(data[key])
    }).join("&")
  }

  async trans({text, from, to, type, mode}:IWrapTransInfo) :Promise<IRequestResult> {

    const tooLongErr = this.checkTextLen(text)
    if(tooLongErr) {
      return tooLongErr
    }

    const baseUrl = 'https://translate.googleapis.com/translate_a/single'

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

    const dtPramas = type === 'sub' ? 'dt=rm&dt=ex&dt=bd&' : 'dt=rm&'
    
    //@ts-ignore
    const paramsData = new URLSearchParams({
      client: 'webapp',
      sl: from,
      tl: to,
      dj: '1',
      q: text,
      dt: 't',
    })

    const realUrl = baseUrl + '?' + dtPramas + paramsData.toString() + this.tkTool.getTk(text)
    const start = new Date().getTime()
    let errRes:IRequestResult|undefined = undefined;

    let find:Response|undefined = undefined;
    try {
      find = await fetch(realUrl)
    } catch {
      if (!find) {
        return <IRequestResult>{
          errMsg: 'unkown err!',
          toastMsg: {
            type: 'i18n',
            message: '__fetchErr__'
          }
        }
      }
    }
    
    const cost = new Date().getTime() - start
    if(find.status !== 200) {
      console.log('trans err')
      if(find.status == 429) {
        errRes = {
          status: find.status,
          errMsg: 'gl_trans_err_429',
          toastMsg: {
            type: 'i18n',
            message: '__reqErr__'
          }
        }
      } else if (find.status === 403) {
        errRes = {
          status: find.status,
          errMsg: 'gl_trans_err_403',
          toastMsg: {
            type: 'i18n',
            message: '__reqErr__'
          }
        }
      } else {
        errRes = {
          status: find.status,
          errMsg: `gl_trans_bad_${find.status}`,
          toastMsg: {
            type: 'i18n',
            message: '__reqErr__'
          }
        }
      }
    }

    if(errRes) {
      eventToGoogle({
        name: 'google_trans_err',
        params: {
          from: from,
          to: to,
          type: type,
          textLenght: text.length,
          cost,
          errMsg: errRes.errMsg,
          tClient: this.tkTool.client,
          ttk: this.tkTool.ttk,
          lt: getTextLimit(text, 20),
          trans_mode: mode
        }
      })
      this.tkTool.next()
      return errRes
    }

    const body = await find.text()

    const jsonBody:ITransResultFromApi = JSON.parse(body)
    
    const result:ITransResult = {
      text: '',
      resultFrom: jsonBody.src,
      //@ts-ignore
      resultTo: to,
      sPronunciation: '',
      tPronunciation: '',
      data: jsonBody,
      engine: 'ggTrans__common'
    }
    // if(type === 'sub') {
      jsonBody.sentences.slice(0, -1).forEach((s:any) => {
        result.text += s.trans
      })
      result.sPronunciation = jsonBody.sentences.slice(-1)[0].src_translit
      result.tPronunciation = jsonBody.sentences.slice(-1)[0].translit
    // } else {
    //   jsonBody.sentences.forEach((s:any) => {
    //     result.text += s.trans
    //   })
    // }
    eventToGoogle({
      name: 'google_trans',
      params: {
        from: from,
        to: to,
        resultFrom: result.resultFrom,
        type: type,
        textLenght: text.length,
        cost,
        lt: getTextLimit(text, 20),
        trans_mode: mode
      }
    })
    return {
      status: find.status,
      errMsg: '',
      data: result,
    }
  }

}

const langCharRange = {
  "zh-Cn": /[\u4E00-\u9FA5]+/,
  en: /[\u0041-\u005A]/,

}

export enum languages {
  auto = "自动检测",  // Automatic
  "zh-CN" = "Chinese",
  "zh-TW" = "Chinese(HK)",
  af = "Afrikaans",
  am = "Amharic",
  ar = "Arabic",
  az = "Azerbaijani",
  be = "Belarusian",
  bg = "Bulgarian",
  bn = "Bengali",
  bs = "Bosnian",
  ca = "Catalan",
  ceb = "Cebuano",
  co = "Corsican",
  cs = "Czech",
  cy = "Welsh",
  da = "Danish",
  de = "German",
  el = "Greek",
  en = "English",
  eo = "Esperanto",
  es = "Spanish",
  et = "Estonian",
  eu = "Basque",
  fa = "Persian",
  fi = "Finnish",
  fr = "French",
  fy = "Frisian",
  ga = "Irish",
  gd = "Scots Gaelic",
  gl = "Galician",
  gu = "Gujarati",
  ha = "Hausa",
  haw = "Hawaiian",
  he = "Hebrew",
  hi = "Hindi",
  hmn = "Hmong",
  hr = "Croatian",
  ht = "Haitian Creole",
  hu = "Hungarian",
  hy = "Armenian",
  id = "Indonesian",
  ig = "Igbo",
  is = "Icelandic",
  it = "Italian",
  iw = "Hebrew",
  ja = "Japanese",
  jw = "Javanese",
  ka = "Georgian",
  kk = "Kazakh",
  km = "Khmer",
  kn = "Kannada",
  ko = "Korean",
  ku = "Kurdish (Kurmanji)",
  ky = "Kyrgyz",
  la = "Latin",
  lb = "Luxembourgish",
  lo = "Lao",
  lt = "Lithuanian",
  lv = "Latvian",
  mg = "Malagasy",
  mi = "Maori",
  mk = "Macedonian",
  ml = "Malayalam",
  mn = "Mongolian",
  mr = "Marathi",
  ms = "Malay",
  mt = "Maltese",
  my = "Myanmar (Burmese)",
  ne = "Nepali",
  nl = "Dutch",
  no = "Norwegian",
  ny = "Chichewa",
  pa = "Punjabi",
  pl = "Polish",
  ps = "Pashto",
  pt = "Portuguese",
  ro = "Romanian",
  ru = "Russian",
  sd = "Sindhi",
  si = "Sinhala",
  sk = "Slovak",
  sl = "Slovenian",
  sm = "Samoan",
  sn = "Shona",
  so = "Somali",
  sq = "Albanian",
  sr = "Serbian",
  st = "Sesotho",
  su = "Sundanese",
  sv = "Swedish",
  sw = "Swahili",
  ta = "Tamil",
  te = "Telugu",
  tg = "Tajik",
  th = "Thai",
  tl = "Filipino",
  tr = "Turkish",
  uk = "Ukrainian",
  ur = "Urdu",
  uz = "Uzbek",
  vi = "Vietnamese",
  xh = "Xhosa",
  yi = "Yiddish",
  yo = "Yoruba",
  zu = "Zulu",
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
      to = await getMainLang()
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