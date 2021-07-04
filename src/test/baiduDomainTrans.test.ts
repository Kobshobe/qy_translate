// import {BDDMTranslate} from '@/translator/baiduDomainTrans'
import {checkLang, bdLangSupport} from '@/translator/language'

test('baidu lang support check', async () => {
    expect('').toBe('')
    expect(checkLang('en','zh','bdTrans__',bdLangSupport)).toBe('')
    expect(checkLang('en','ara','bdTrans__',bdLangSupport)).toBe('')
    //@ts-ignore
    expect(checkLang('en', undefined,'bdTrans__',bdLangSupport)).toBe('__noSupport__')

    expect(checkLang('en','zh','bdDM__finance',bdLangSupport)).toBe('')
    expect(checkLang('zh','en','bdDM__finance',bdLangSupport)).toBe('')
    expect(checkLang('auto','zh','bdDM__finance',bdLangSupport)).toBe('')
    expect(checkLang('ara','en','bdDM__finance',bdLangSupport)).toBe('__onlyEnAndZh__')
    expect(checkLang('en','ara','bdDM__finance',bdLangSupport)).toBe('__onlyEnAndZh__')

    //@ts-ignore
    expect(checkLang('zh',undefined,'bdDM__electronics',bdLangSupport)).toBe('__onlyZhToZh__')
    expect(checkLang('zh','en','bdDM__electronics',bdLangSupport)).toBe('')
    expect(checkLang('en','zh','bdDM__electronics',bdLangSupport)).toBe('__onlyZhToZh__')
    expect(checkLang('zh','en','bdDM__novel',bdLangSupport)).toBe('')
    expect(checkLang('en','zh','bdDM__novel',bdLangSupport)).toBe('__onlyZhToZh__')
    
})