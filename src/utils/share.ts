

export function getLocaleLang() :string {
    const lang = navigator.language
    if(lang === 'zh' || lang === 'zh-CN') {
      return 'zh-CN'
    } else if(lang === 'ja' || lang === 'ja-JP') {
      return 'ja'
    } else {
      return 'en'
    }
}

export function geti18nMsg(code:string) :string {
  return chrome.i18n.getMessage(code)
}