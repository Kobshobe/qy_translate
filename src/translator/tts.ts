// import assertInputTypes from './assertInputTypes';
// import axios from 'axios';
import { baseFetch } from '../api/api'
import { eventToGoogle } from '@/utils/analytics'
import {IContext} from '@/interface/trans'
import {BaiduTrans} from '@/translator/baiduTrans'

interface Option {
  lang?: string;
  slow?: boolean;
  host?: string;
  timeout?: number;
}

export class TTS {
  player = new Audio()
  engine = new BaiduTrans()

  play(text:string, lang:string, delay:number) {
    eventToGoogle({
      name: 'optionPlayTTS',
      params: {
        lang,
        tLen: text.length
      }
    })
    return new Promise((resolve) => {
      this.player.pause()
      this.player = new Audio()
      this.player.addEventListener('ended', () => {
        resolve('')
      })
      this.player.addEventListener('pause', () => {
        resolve('')
      })
      this.player.src = this.getAudioSrc(text, lang)
      setTimeout(()=> {
        this.player.play()
      }, delay)
      
    })
    
  }

  getAudioSrc(text:string, lang:string) {
    // return `https://translate.google.cn/translate_tts?ie=UTF-8&q=${text}&tl=${lang}&total=1&idx=0&textlen=5&client=dict-chrome-ex&prev=input&ttsspeed=1`
    return this.engine.getTTSSrc(lang, text)
  }
}

export function getAudioSrc(text:string, lang:string) {
  return `https://translate.google.cn/translate_tts?ie=UTF-8&q=${text}&tl=${lang}&total=1&idx=0&textlen=5&client=dict-chrome-ex&prev=input&ttsspeed=1`
}

const assertInputTypes = (text: string, lang: string, slow: boolean, host: string) => {
  if (typeof text !== 'string' || text.length === 0) {
    throw new TypeError('text should be a string');
  }

  if (typeof lang !== 'string' || lang.length === 0) {
    throw new TypeError('lang should be a string');
  }

  if (typeof slow !== 'boolean') {
    throw new TypeError('slow should be a boolean');
  }

  if (typeof host !== 'string' || host.length === 0) {
    throw new TypeError('host should be a string');
  }
};

/**
 * Get "Google TTS" audio base64 text
 *
 * @param {string}   text           length should be less than 200 characters
 * @param {object?}  option
 * @param {string?}  option.lang    default is "en"
 * @param {boolean?} option.slow    default is false
 * @param {string?}  option.host    default is "https://translate.google.com"
 * @param {number?}  option.timeout default is 10000 (ms)
 * @returns {Promise<string>} url
 */
export const getAudioBase64 = async (c:IContext): Promise<IContext> => { 
  // assertInputTypes(c.req.text, c.req.lang, slow, host);

  // text: string,
  // audioType: string,
  // { lang = 'en', slow = false, host = 'https://translate.google.cn', timeout = 10000 }: Option = {}


  if (c.req.text.length > 200) {
    eventToGoogle({
      name: "tts_too_long_err",
      params: {textLenght: c.req.text.length}
    })
    c.resp = {
      errMsg: 'too long',
      toastMsg: {
        type: 'i18n',
        message: '__textTooLong__',
      }
    }
    return c
  }

  const start = new Date().getTime()
  const res = await baseFetch({
    method: 'POST',
    url: 'https://translate.google.cn/_/TranslateWebserverUi/data/batchexecute',
    headers: {
      'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
    },
    data:
      'f.req=' +
      encodeURIComponent(
        JSON.stringify([
          [['jQ1olc', JSON.stringify([c.req.text, c.req.lang, false, 'null']), null, 'generic']],
        ])
      ),
    successStatusCode: [200]
  });

  let result;
  if(res.errMsg) {
    eventToGoogle({
      name: 'google_tts_Err',
      params: {
        status: res.status,
        cost: new Date().getTime() - start,
        len: c.req.text.length,
        audioType: c.req.audioType,
        msg: res.errMsg,
      }
    })

    c.resp = {
      errMsg: "google trans err",
      toastMsg: {
        message: '__reqErr__',
        type: 'i18n'
      }
    }
    return c
  } else {
    result = res.data
  }


  // 1. parse audio base64 string
  try {
    result = JSON.parse(res.data.slice(5));
  } catch (e) {
    eventToGoogle({
      name: 'parse_tts_data_err',
      params: {
        len: c.req.text.length,
        audioType: c.req.audioType,
      }
    })
    c.resp = {
      errMsg: 'parse tts data err',
      toastMsg: {
        type: 'i18n',
        message: '__textTooLong__',
      }
    }
    return c
  }

  // Check the result. The result will be null if given the lang doesn't exist
  if (!result) {
    // throw new Error(`lang "${lang}" might not exist`);
    eventToGoogle({
      name: 'tts_may_not_support',
      params: {
        len: c.req.text.length,
        audioType: c.req.audioType,
      }
    })
    c.resp = {
      errMsg: 'may_not_support_lang',
    }
    return c
  }

  // 2. continue to parse audio base64 string
  try {
    result = JSON.parse(result[0][2]) // eval(result)[0];
  } catch (e) {
    eventToGoogle({
      name: 'parse_tts_base64_err',
      params: {audioType: c.req.audioType}
    })
    c.resp = {
      errMsg: 'parse_tts_base64_err',
      toastMsg: {
        type: 'i18n',
        message: '__hasErr__'
      }
    }
    return c
  }

  eventToGoogle({
    name: 'google_tts',
    params: {
      status: res.status,
      cost: new Date().getTime() - start,
      len: c.req.text.length,
      audioType: c.req.audioType
    }
  })

  c.resp =  {
    errMsg:'',
    data: result[0]
  };
  return c
};

// export const getBDBase64 = async (c:IContext) :Promise<IContext> => {
//   const HOST = 'https://fanyi.baidu.com/'
//   let src = `${HOST}gettts?lan=${c.req.lang}&text=${encodeURIComponent(c.req.text)}&spd=${'fast'}&source=web`;
//   console.log(src)
//   let res = await baseFetch({
//     url: src,
//     method: "get",
//     successStatusCode: [200]
//   })
//   console.log("res: --- ", res.data)
//   return c
// }

interface LongTextOption extends Option {
  splitPunct?: string;
}

/**
 * @typedef {object} Result
 * @property {string} shortText
 * @property {string} base64
 */

/**
 * Split the long text into multiple short text and generate audio base64 list
 *
 * @param {string}   text
 * @param {object?}  option
 * @param {string?}  option.lang        default is "en"
 * @param {boolean?} option.slow        default is false
 * @param {string?}  option.host        default is "https://translate.google.com"
 * @param {string?}  option.splitPunct  split punctuation
 * @param {number?}  option.timeout     default is 10000 (ms)
 * @return {Result[]} the list with short text and audio base64
 */
// export const getAllAudioBase64 = async (
//   text: string,
//   {
//     lang = 'en',
//     slow = false,
//     host = 'https://translate.google.com',
//     splitPunct = '',
//     timeout = 10000,
//   }: LongTextOption = {}
// ): Promise<{ shortText: string; base64: string }[]> => {
//   assertInputTypes(text, lang, slow, host);

//   if (typeof splitPunct !== 'string') {
//     throw new TypeError('splitPunct should be a string');
//   }

//   if (typeof timeout !== 'number' || timeout <= 0) {
//     throw new TypeError('timeout should be a positive number');
//   }

//   const shortTextList = splitLongText(text, { splitPunct });
//   const base64List = await Promise.all(
//     shortTextList.map((shortText) => getAudioBase64(shortText, { lang, slow, host, timeout }))
//   );

//   // put short text and base64 text in a list
//   const result: { shortText: string; base64: string }[] = [];
//   for (let i = 0; i < shortTextList.length; i++) {
//     const shortText = shortTextList[i];
//     const base64 = base64List[i];
//     //@ts-ignore ------------
//     result.push({ shortText, base64 });
//   }

//   return result;
// };