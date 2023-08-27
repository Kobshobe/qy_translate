export const engines = [
  {
    code: '__commonTrans__',
    engines: {
      baidu:{
        code: 'bdTrans__common'
      }
      // bing: {
      //   code: 'bing__common'
      // },
      // google: {
      //   code: 'ggTrans__common'
      // },
    }
  },
  {
    code: '__domainTrans__',
    engines: {
      alDM__social: {
        code: 'alDM__social'
      },
      alDM__finance: {
        code: 'alDM__finance'
      },
      alDM__medical: {
        code: 'alDM__medical'
      },
      alDM__title: {
        code: 'alDM__title'
      },
      alDM__communication: {
        code: 'alDM__communication'
      },
      alDM__description: {
        code: 'alDM__description'
      },
      bdFinance: {
        code: 'bdDM__finance'
      },
      bdElectronics: {
        code: 'bdDM__electronics'
      },
      bdMechanics: {
        code: 'bdDM__mechanics'
      },
      bdMedicine: {
        code: 'bdDM__medicine'
      },
      bdNovel: {
        code: 'bdDM__novel'
      }
    }
  }
]

export function checkDomainLang(from:string, to:string, engine:string, support:any) :string {
  if (support[engine].support[from] && support[engine].support[from].has(to)) {
    return ''
  }
  return support[engine].noSupportMsg
}


export const languages = {
    auto: { en: 'auto detect', 'zh-CN': '自动检测'},
    __auto__: { en: 'auto exchange', 'zh-CN': '智能转换'},
    en: { en: 'English', 'zh-CN': '英文'},
    'zh-CN': { en: 'Chinese', 'zh-CN': '简体中文'},
    ja: { en: 'Japanese', 'zh-CN': '日语'},
    ko: { en: 'Korean', 'zh-CN': '韩语'},
    fr: { en: 'French', 'zh-CN': '法语'},
    de: { en: 'German', 'zh-CN': '德语'},
    es: { en: 'Spanish', 'zh-CN': '西班牙语'},
    ru: { en: 'Russian', 'zh-CN': '俄语'},
    'zh-TW': { en: 'Chinese(TW)', 'zh-CN': '繁体中文'},
    th: { en: 'Thai', 'zh-CN': '泰语'},
    af: { en: 'Afrikaans', 'zh-CN': '南非荷兰语'},
    am: { en: 'Amharic', 'zh-CN': '阿姆哈拉语'},
    ar: { en: 'Arabic', 'zh-CN': '阿拉伯语'},
    az: { en: 'Azerbaijani', 'zh-CN': '阿塞拜疆语'},
    be: { en: 'Belarusian', 'zh-CN': '白俄罗斯语'},
    bg: { en: 'Bulgarian', 'zh-CN': '保加利亚语'},
    bn: { en: 'Bengali', 'zh-CN': '孟加拉语'},
    bs: { en: 'Bosnian', 'zh-CN': '波斯尼亚语'},
    ca: { en: 'Catalan', 'zh-CN': '加泰罗尼亚语'},
    ceb: { en: 'Cebuano', 'zh-CN': '宿务语'},
    co: { en: 'Corsican', 'zh-CN': '科西嘉语'},
    cs: { en: 'Czech', 'zh-CN': '捷克语'},
    cy: { en: 'Welsh', 'zh-CN': '威尔士语'},
    da: { en: 'Danish', 'zh-CN': '丹麦语'},
    el: { en: 'Greek', 'zh-CN': '希腊语'},
    eo: { en: 'Esperanto', 'zh-CN': '世界语'},
    et: { en: 'Estonian', 'zh-CN': '爱沙尼亚语'},
    eu: { en: 'Basque', 'zh-CN': '巴斯克语'},
    fa: { en: 'Persian', 'zh-CN': '波斯语'},
    fi: { en: 'Finnish', 'zh-CN': '芬兰'},
    fy: { en: 'Frisian', 'zh-CN': '弗里西亚语'},
    ga: { en: 'Irish', 'zh-CN': '爱尔兰语'},
    gd: { en: 'Scots Gaelic', 'zh-CN': '苏格兰语'},
    gl: { en: 'Galician', 'zh-CN': '加利西亚语'},
    gu: { en: 'Gujarati', 'zh-CN': '古吉拉特语'},
    ha: { en: 'Hausa', 'zh-CN': 'Hausa.'},
    haw: { en: 'Hawaiian', 'zh-CN': '夏威夷语'},
    he: { en: 'Hebrew', 'zh-CN': '希伯来语'},
    hi: { en: 'Hindi', 'zh-CN': '印地语'},
    hmn: { en: 'Hmong', 'zh-CN': '苗语'},
    hr: { en: 'Croatian', 'zh-CN': '克罗地亚语'},
    ht: { en: 'Haitian', 'zh-CN': '海地语'},
    hu: { en: 'Hungarian', 'zh-CN': '匈牙利语'},
    hy: { en: 'Armenian', 'zh-CN': '亚美尼亚语'},
    id: { en: 'Indonesian', 'zh-CN': '印尼语'},
    is: { en: 'Icelandic', 'zh-CN': '冰岛语'},
    it: { en: 'Italian', 'zh-CN': '意大利语'},
    iw: { en: 'Hebrew', 'zh-CN': '希伯来语'},
    jw: { en: 'Javanese', 'zh-CN': '爪哇语'},
    ka: { en: 'Georgian', 'zh-CN': '格鲁吉亚语'},
    kk: { en: 'Kazakh', 'zh-CN': '哈萨克'},
    km: { en: 'Khmer', 'zh-CN': '高棉'},
    kn: { en: 'Kannada', 'zh-CN': '凯纳达'},
    ku: {en: 'Kurdish','zh-CN': '库尔德'},
    ky: { en: 'Kyrgyz', 'zh-CN': '吉尔吉斯语'},
    la: { en: 'Latin', 'zh-CN': '拉丁语'},
    lb: { en: 'Luxembourgish', 'zh-CN': '卢森堡语'},
    lo: { en: 'Lao', 'zh-CN': '老挝'},
    lt: { en: 'Lithuanian', 'zh-CN': '立陶宛语'},
    lv: { en: 'Latvian', 'zh-CN': '拉脱维亚语'},
    mg: { en: 'Malagasy', 'zh-CN': '马尔加什'},
    mi: { en: 'Maori', 'zh-CN': '毛利语'},
    mk: { en: 'Macedonian', 'zh-CN': '马其顿语'},
    ml: { en: 'Malayalam', 'zh-CN': '马拉雅拉姆'},
    mn: { en: 'Mongolian', 'zh-CN': '蒙古语'},
    mr: { en: 'Marathi', 'zh-CN': '马拉地语'},
    ms: { en: 'Malay', 'zh-CN': '马来语'},
    mt: { en: 'Maltese', 'zh-CN': '马耳他语'},
    my: { en: 'Myanmar', 'zh-CN': '缅甸语'},
    ne: { en: 'Nepali', 'zh-CN': '尼泊尔语'},
    nl: { en: 'Dutch', 'zh-CN': '荷兰语'},
    no: { en: 'Norwegian', 'zh-CN': '挪威语'},
    ny: { en: 'Chichewa', 'zh-CN': 'Chichewa.'},
    pa: { en: 'Punjabi', 'zh-CN': '旁遮普语'},
    pl: { en: 'Polish', 'zh-CN': '波兰语'},
    ps: { en: 'Pashto', 'zh-CN': '普什图语'},
    pt: { en: 'Portuguese', 'zh-CN': '葡萄牙语'},
    ro: { en: 'Romanian', 'zh-CN': '罗马尼亚语'},
    sd: { en: 'Sindhi', 'zh-CN': '信德语'},
    si: { en: 'Sinhala', 'zh-CN': '僧伽罗语'},
    sk: { en: 'Slovak', 'zh-CN': '斯洛伐克语'},
    sl: { en: 'Slovenian', 'zh-CN': '斯洛文尼亚语'},
    sm: { en: 'Samoan', 'zh-CN': '萨摩亚语'},
    sn: { en: 'Shona', 'zh-CN': 'Shona'},
    so: { en: 'Somali', 'zh-CN': '索马里语'},
    sq: { en: 'Albanian', 'zh-CN': '阿尔巴尼亚语'},
    sr: { en: 'Serbian', 'zh-CN': '塞尔维亚语'},
    st: { en: 'Sesotho', 'zh-CN': '索托托'},
    su: { en: 'Sundanese', 'zh-CN': '巽他语'},
    sv: { en: 'Swedish', 'zh-CN': '瑞典语'},
    sw: { en: 'Swahili', 'zh-CN': '斯瓦希里语'},
    ta: { en: 'Tamil', 'zh-CN': '泰米尔'},
    te: { en: 'Telugu', 'zh-CN': '泰卢固语'},
    tg: { en: 'Tajik', 'zh-CN': '塔吉克语'},
    tl: { en: 'Filipino', 'zh-CN': '菲律宾语'},
    tr: { en: 'Turkish', 'zh-CN': '土耳其语'},
    uk: { en: 'Ukrainian', 'zh-CN': '乌克兰语'},
    ur: { en: 'Urdu', 'zh-CN': '乌尔都语'},
    uz: { en: 'Uzbek', 'zh-CN': '乌兹别克语'},
    vi: { en: 'Vietnamese', 'zh-CN': '越南语'},
    xh: { en: 'Xhosa', 'zh-CN': '科萨'},
    yi: { en: 'Yiddish', 'zh-CN': '意第绪语'},
    yo: { en: 'Yoruba', 'zh-CN': '约鲁巴语'},
    zu: { en: 'Zulu', 'zh-CN': '祖鲁'}
}

export const SToAlibaba:Iterable<readonly [string, string]> = [
  ['zh-CN', 'zh'],
  ['zh-TW', 'zh-tw'],
  // ['', 'yue'],
  ['en', 'en'],
  ['ja', 'ja'],
  ['ko', 'ko'],
  ['es', 'es'],
  ['fr', 'fr'],
  ['pt', 'pt'],
  ['it', 'it'],
  ['ru', 'ru'],
  ['ar', 'ar'],
  ['tr', 'tr'],
  ['th', 'th'],
  ['id', 'id'],
  ['vi', 'vi'],
  ['ms', 'ms'],
  ['he', 'he'],
  ['hi', 'hi'],
  ['pl', 'pl'],
  ['nl', 'nl'],
  ['de', 'de'],
]

export const SToBaidu:Iterable<readonly [string, string]> = [
  [ 'auto', 'auto' ], [ 'zh-CN', 'zh' ], [ 'zh-TW', 'cht' ], [ 'af', 'afr' ],
  [ 'am', 'amh' ],    [ 'ar', 'ara' ],   [ 'az', 'aze' ],    [ 'be', 'bel' ],
  [ 'bg', 'bul' ],    [ 'bn', 'ben' ],   [ 'bs', 'bos' ],    [ 'ca', 'cat' ],
  [ 'ceb', 'ceb' ],   [ 'co', 'cos' ],   [ 'cs', 'cs' ],     [ 'cy', 'wel' ],
  [ 'da', 'dan' ],    [ 'de', 'de' ],    [ 'el', 'el' ],     [ 'en', 'en' ],
  [ 'eo', 'epo' ],    [ 'es', 'spa' ],   [ 'et', 'est' ],    [ 'eu', 'baq' ],
  [ 'fa', 'per' ],    [ 'fi', 'fin' ],   [ 'fr', 'fra' ],    [ 'ga', 'gle' ],
  [ 'gd', 'gla' ],    [ 'gl', 'glg' ],   [ 'gu', 'guj' ],    [ 'ha', 'hau' ],
  [ 'haw', 'haw' ],   [ 'he', 'heb' ],   [ 'hi', 'hi' ],     [ 'hmn', 'hmn' ],
  [ 'hr', 'hrv' ],    [ 'ht', 'ht' ],    [ 'hu', 'hu' ],     [ 'hy', 'arm' ],
  [ 'id', 'id' ],     [ 'ig', 'ibo' ],   [ 'is', 'ice' ],    [ 'it', 'it' ],
  [ 'iw', 'heb' ],    [ 'ja', 'jp' ],    [ 'jw', 'jav' ],    [ 'ka', 'geo' ],
  [ 'km', 'hkm' ],    [ 'ko', 'kor' ],   [ 'ku', 'kur' ],    [ 'ky', 'kir' ],
  [ 'la', 'lat' ],    [ 'lb', 'ltz' ],   [ 'lo', 'lao' ],    [ 'lt', 'lit' ],
  [ 'lv', 'lav' ],    [ 'mi', 'mao' ],   [ 'mk', 'mac' ],    [ 'ml', 'mal' ],
  [ 'mr', 'mar' ],    [ 'ms', 'may' ],   [ 'mt', 'mlt' ],    [ 'my', 'bur' ],
  [ 'ne', 'nep' ],    [ 'nl', 'nl' ],    [ 'no', 'nor' ],    [ 'pa', 'pan' ],
  [ 'pl', 'pl' ],     [ 'ps', 'pus' ],   [ 'pt', 'pt' ],     [ 'ro', 'rom' ],
  [ 'ru', 'ru' ],     [ 'sd', 'snd' ],   [ 'si', 'sin' ],    [ 'sk', 'sk' ],
  [ 'sl', 'slo' ],    [ 'sm', 'sm' ],    [ 'so', 'som' ],    [ 'sq', 'alb' ],
  [ 'sr', 'srp' ],    [ 'su', 'sun' ],   [ 'sv', 'swe' ],    [ 'sw', 'swa' ],
  [ 'ta', 'tam' ],    [ 'te', 'tel' ],   [ 'tg', 'tgk' ],    [ 'th', 'th' ],
  [ 'tl', 'fil' ],    [ 'tr', 'tr' ],    [ 'uk', 'ukr' ],    [ 'ur', 'urd' ],
  [ 'vi', 'vie' ],    [ 'xh', 'xho' ],   [ 'yi', 'yid' ],    [ 'yo', 'yor' ],
  [ 'zu', 'zul' ],
]

export const SToGoogle: Iterable<readonly [string, string]> = [
  [ 'auto', 'auto' ], [ 'zh-CN', 'zh-CN' ], [ 'zh-TW', 'zh-TW' ],
      [ 'af', 'af' ],     [ 'am', 'am' ],       [ 'ar', 'ar' ],
      [ 'az', 'az' ],     [ 'be', 'be' ],       [ 'bg', 'bg' ],
      [ 'bn', 'bn' ],     [ 'bs', 'bs' ],       [ 'ca', 'ca' ],
      [ 'ceb', 'ceb' ],   [ 'co', 'co' ],       [ 'cs', 'cs' ],
      [ 'cy', 'cy' ],     [ 'da', 'da' ],       [ 'de', 'de' ],
      [ 'el', 'el' ],     [ 'en', 'en' ],       [ 'eo', 'eo' ],
      [ 'es', 'es' ],     [ 'et', 'et' ],       [ 'eu', 'eu' ],
      [ 'fa', 'fa' ],     [ 'fi', 'fi' ],       [ 'fr', 'fr' ],
      [ 'fy', 'fy' ],     [ 'ga', 'ga' ],       [ 'gd', 'gd' ],
      [ 'gl', 'gl' ],     [ 'gu', 'gu' ],       [ 'ha', 'ha' ],
      [ 'haw', 'haw' ],   [ 'he', 'he' ],       [ 'hi', 'hi' ],
      [ 'hmn', 'hmn' ],   [ 'hr', 'hr' ],       [ 'ht', 'ht' ],
      [ 'hu', 'hu' ],     [ 'hy', 'hy' ],       [ 'id', 'id' ],
      [ 'ig', 'ig' ],     [ 'is', 'is' ],       [ 'it', 'it' ],
      [ 'iw', 'iw' ],     [ 'ja', 'ja' ],       [ 'jw', 'jw' ],
      [ 'ka', 'ka' ],     [ 'kk', 'kk' ],       [ 'km', 'km' ],
      [ 'kn', 'kn' ],     [ 'ko', 'ko' ],       [ 'ku', 'ku' ],
      [ 'ky', 'ky' ],     [ 'la', 'la' ],       [ 'lb', 'lb' ],
      [ 'lo', 'lo' ],     [ 'lt', 'lt' ],       [ 'lv', 'lv' ],
      [ 'mg', 'mg' ],
      [ 'mi', 'mi' ], [ 'mk', 'mk' ], [ 'ml', 'ml' ],
      [ 'mn', 'mn' ], [ 'mr', 'mr' ], [ 'ms', 'ms' ],
      [ 'mt', 'mt' ], [ 'my', 'my' ], [ 'ne', 'ne' ],
      [ 'nl', 'nl' ], [ 'no', 'no' ], [ 'ny', 'ny' ],
      [ 'pa', 'pa' ], [ 'pl', 'pl' ], [ 'ps', 'ps' ],
      [ 'pt', 'pt' ], [ 'ro', 'ro' ], [ 'ru', 'ru' ],
      [ 'sd', 'sd' ], [ 'si', 'si' ], [ 'sk', 'sk' ],
      [ 'sl', 'sl' ], [ 'sm', 'sm' ], [ 'sn', 'sn' ],
      [ 'so', 'so' ], [ 'sq', 'sq' ], [ 'sr', 'sr' ],
      [ 'st', 'st' ], [ 'su', 'su' ], [ 'sv', 'sv' ],
      [ 'sw', 'sw' ], [ 'ta', 'ta' ], [ 'te', 'te' ],
      [ 'tg', 'tg' ], [ 'th', 'th' ], [ 'tl', 'tl' ],
      [ 'tr', 'tr' ], [ 'uk', 'uk' ], [ 'ur', 'ur' ],
      [ 'uz', 'uz' ], [ 'vi', 'vi' ], [ 'xh', 'xh' ],
      [ 'yi', 'yi' ], [ 'yo', 'yo' ], [ 'zu', 'zu' ]
]

export const bdLangSupport = {
  bdTrans__common: {
    noSupportMsg: '__noSupport__'
  },
  bdDM__finance: {
    support: {
      en: new Set(['zh']),
      zh: new Set(['en'])
    },
    noSupportMsg: '__onlyEnAndZh__'
  },
  bdDM__medicine: {
    support: {
      en: new Set(['zh']),
      zh: new Set(['en'])
    },
    noSupportMsg: '__onlyEnAndZh__'
  },
  bdDM__electronics: {
    support: {
      zh: new Set(['en'])
    },
    noSupportMsg: '__onlyZhToZh__'
  },
  bdDM__mechanics: {
    support: {
      zh: new Set(['en'])
    },
    noSupportMsg: '__onlyZhToZh__'
  },
  bdDM__novel: {
    support: {
      zh: new Set(['en'])
    },
    noSupportMsg: '__onlyZhToZh__'
  }
}

export const alLangSupport = {
  alDM__finance: {
    support: {
      en: new Set(['zh']),
      zh: new Set(['en'])
    },
    noSupportMsg: '__onlyEnAndZh__'
  },
  alDM__medical: {
    support: {
      en: new Set(['zh']),
      ja: new Set(['zh']),
      zh: new Set(['en', 'ja'])
    },
    noSupportMsg: '__noSupport__'
  },
  alDM__social: {
    support: {
      en: new Set(['zh']),
      ja: new Set(['zh']),
      ko: new Set(['zh']),
      zh: new Set(['en', 'ja', 'ko'])
    },
    noSupportMsg: '__noSupport__'
  },
  alDM__title: {
    support: {
      ja: new Set(['zh']),
      ko: new Set(['zh']),
      ms: new Set(['en']),
      'zh-tw': new Set(['zh']),
      en: new Set(['zh', 'ja', 'ko', 'es', 'fr', 'it', 'ru', 'ar', 'tr', 'th', 'id', 'vi', 'ms', 'he', 'hi', 'nl', 'de', 'zh-tw']),
      zh: new Set(['en', 'ja', 'ko', 'id', 'th', 'vi', 'ms', 'zh-tw', 'es', 'fr', 'ru'])
    },
    noSupportMsg: '__noSupport__'
  },
  alDM__description: {
    support: {
      ja: new Set(['zh']),
      ko: new Set(['zh']),
      ms: new Set(['en']),
      'zh-tw': new Set(['zh']),
      en: new Set(['zh', 'ja', 'ko', 'es', 'fr', 'it', 'ru', 'ar', 'tr', 'th', 'id', 'vi', 'ms', 'he', 'hi', 'nl', 'de', 'zh-tw']),
      zh: new Set(['en', 'ja', 'ko', 'id', 'th', 'vi', 'ms', 'zh-tw', 'es', 'fr', 'ru'])
    },
    noSupportMsg: '__noSupport__'
  },
  alDM__communication: {
    support: {
      en: new Set(['zh', 'ar', 'ru', 'fr', 'th', 'tr', 'es', 'vi', 'it', 'ms']),
      zh: new Set(['en', 'ar', 'ru', 'fr', 'th', 'tr', 'es', 'vi', 'it', 'ms']),
      ar: new Set(['en', 'zh']),
      ru: new Set(['en', 'zh']),
      fr: new Set(['en', 'zh']),
      th: new Set(['en', 'zh']),
      tr: new Set(['en', 'zh']),
      es: new Set(['en', 'zh']),
      vi: new Set(['en', 'zh']),
      it: new Set(['en', 'zh']),
      ms: new Set(['en', 'zh']),
    },
    noSupportMsg: '__noSupport__'
  }
}