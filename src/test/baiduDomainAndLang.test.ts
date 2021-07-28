import {languages, SToBaidu} from '@/translator/language'
import {BaiduTrans} from '@/translator/baiduTrans'
import {IWrapTransInfo} from '@/interface/trans'

// function cp() {
//     const l = []
//     for(let key in GToBaidu) {
//         //@ts-ignore
//         const v = GToBaidu[key]
//         if (v) {
//             l.push([key, v])
//         }
        
//     }
//     console.log(l)

// }

test('baidu domain and lang support check', async () => {
    expect('').toBe('')
    const trans = new BaiduTrans()
    expect(trans.getELang('zh-CN')).toBe('zh')
    expect(trans.getSLang('zh')).toBe('zh-CN')


    expect(trans.checkELang('en','zh','bdDM__finance')).toBe('')
    expect(trans.checkELang('zh','en','bdDM__finance')).toBe('')
    expect(trans.checkELang('auto','zh','bdDM__finance')).toBe('__onlyEnAndZh__')
    expect(trans.checkELang('ara','en','bdDM__finance')).toBe('__onlyEnAndZh__')
    expect(trans.checkELang('en','ara','bdDM__finance')).toBe('__onlyEnAndZh__')

    //@ts-ignore
    expect(trans.checkELang('zh',undefined,'bdDM__electronics')).toBe('__onlyZhToZh__')
    expect(trans.checkELang('zh','en','bdDM__electronics')).toBe('')
    expect(trans.checkELang('en','zh','bdDM__electronics')).toBe('__onlyZhToZh__')
    expect(trans.checkELang('zh','en','bdDM__novel')).toBe('')
    expect(trans.checkELang('en','zh','bdDM__novel')).toBe('__onlyZhToZh__')

    chrome.storage.sync.set({
        mainLang: 'zh-CN',
        secondLang: 'en'
    })
    const langs = chrome.storage.sync.get(['mainLang','secondLang'], (res) => {
        expect(res.mainLang).toBe('zh-CN')
        expect(res.secondLang).toBe('en')
    })
    let info:IWrapTransInfo = {
        text: 'app',
        from: 'en',
        to: 'zh-CN',
        type: 'popup_icon',
        engine: 'bdTrans__common',
        mode: 'popup'
    }

    await trans.setLangCode({req:info})
    expect(info.from).toBe('en')
    expect(info.fromCode).toBe('en')
    expect(info.toCode).toBe('zh')
    expect(info.isDetectedLang).toBe(true)

    info = {
        text: 'app',
        from: 'zh-CN',
        to: '',
        type: 'popup_icon',
        engine: 'bdTrans__common',
        mode: 'popup'
    }
    await trans.setLangCode({req:info})
    expect(info.from).toBe('zh-CN')
    expect(info.fromCode).toBe('zh')
    expect(info.toCode).toBe('en')

    info = {
        text: 'app',
        from: '',
        to: '',
        type: 'popup_icon',
        engine: 'bdTrans__common',
        mode: 'popup'
    }
    await trans.setLangCode({req:info})
    expect(info.from).toBe('en')
    expect(info.fromCode).toBe('en')
    expect(info.toCode).toBe('zh')

    info = {
        text: '应用程序',
        from: 'auto',
        to: '',
        type: 'popup_icon',
        engine: 'bdTrans__common',
        mode: 'popup'
    }
    await trans.setLangCode({req:info})
    expect(info.from).toBe('zh-CN')
    expect(info.to).toBe('en')
    expect(info.fromCode).toBe('zh')
    expect(info.toCode).toBe('en')
})