// import assertInputTypes from './assertInputTypes';
// import axios from 'axios';
import { baseFetch } from '../api/api'
import splitLongText from './splitLongText';
import { eventToGoogle } from './analytics'

interface Option {
  lang?: string;
  slow?: boolean;
  host?: string;
  timeout?: number;
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
export const getAudioBase64 = async (
  text: string,
  { lang = 'en', slow = false, host = 'https://translate.google.cn', timeout = 10000 }: Option = {}
): Promise<string> => {
  assertInputTypes(text, lang, slow, host);

  if (typeof timeout !== 'number' || timeout <= 0) {
    throw new TypeError('timeout should be a positive number');
  }

  if (text.length > 200) {
    throw new RangeError(
      `text length (${text.length}) should be less than 200 characters. Try "getAllAudioBase64(text, [option])" for long text.`
    );
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
          [['jQ1olc', JSON.stringify([text, lang, slow ? true : null, 'null']), null, 'generic']],
        ])
      ),
    success: async (res: any) => {
      const resJson = await res.text()
      res.data = resJson
      eventToGoogle({
        name: 'google_tts',
        params: {
          status: res.status,
          cost: new Date().getTime() - start,
          len: text.length
        }
      })
      return res
    },
    fail: (err: any) => {
      eventToGoogle({
        name: 'google_tts_Err',
        params: {
          status: err.status,
          cost: new Date().getTime() - start,
          len: text.length
        }
      })
      return null
    },
    successStatusCode: [200]
  });


  // 1. parse audio base64 string
  let result;
  try {
    result = JSON.parse(res.data.slice(5));
  } catch (e) {
    throw new Error(`parse response failed:\n${res.data}`);
  }

  // Check the result. The result will be null if given the lang doesn't exist
  if (!result) {
    throw new Error(`lang "${lang}" might not exist`);
  }

  // 2. continue to parse audio base64 string
  try {
    result = JSON.parse(result[0][2]) // eval(result)[0];
  } catch (e) {
    throw new Error(`parse response base64 failed:\n${result[0][2]}`);
  }

  return result;
};

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
export const getAllAudioBase64 = async (
  text: string,
  {
    lang = 'en',
    slow = false,
    host = 'https://translate.google.com',
    splitPunct = '',
    timeout = 10000,
  }: LongTextOption = {}
): Promise<{ shortText: string; base64: string }[]> => {
  assertInputTypes(text, lang, slow, host);

  if (typeof splitPunct !== 'string') {
    throw new TypeError('splitPunct should be a string');
  }

  if (typeof timeout !== 'number' || timeout <= 0) {
    throw new TypeError('timeout should be a positive number');
  }

  const shortTextList = splitLongText(text, { splitPunct });
  const base64List = await Promise.all(
    shortTextList.map((shortText) => getAudioBase64(shortText, { lang, slow, host, timeout }))
  );

  // put short text and base64 text in a list
  const result: { shortText: string; base64: string }[] = [];
  for (let i = 0; i < shortTextList.length; i++) {
    const shortText = shortTextList[i];
    const base64 = base64List[i];
    result.push({ shortText, base64 });
  }

  return result;
};