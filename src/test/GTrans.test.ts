// import { GoogleTrans } from '@/translator/google'
// import {IWrapTransInfo} from '@/interface/trans'

// function delay(second:number) {
//     return new Promise((resolve) => {
//         setTimeout(() => resolve(true), second * 1000)
//     })
// }

// jest.setTimeout(40000);

// test('google trans test set lang', async () => {
//     console.log('google trans test set lang')
//     expect('').toBe('')
//     const trans = new GoogleTrans()
//     chrome.storage.sync.set({
//         mainLang: 'zh-CN',
//         secondLang: 'en'
//     })
//     const langs = chrome.storage.sync.get(['mainLang','secondLang'], (res) => {
//         expect(res.mainLang).toBe('zh-CN')
//         expect(res.secondLang).toBe('en')
//     })
//     let info:IWrapTransInfo = {
//         text: 'app',
//         from: 'en',
//         to: 'zh-CN',
//         type: 'popup_icon',
//         engine: 'ggTrans__common',
//         mode: 'popup'
//     }

//     await trans.setLangCode({req:info})
//     expect(info.from).toBe('en')
//     expect(info.fromCode).toBe('en')
//     expect(info.toCode).toBe('zh-CN')
//     expect(info.isDetectedLang).toBe(true)

//     info = {
//         text: 'app',
//         from: 'zh-CN',
//         to: '',
//         type: 'popup_icon',
//         engine: 'ggTrans__common',
//         mode: 'popup'
//     }
//     await trans.setLangCode({req:info})
//     expect(info.from).toBe('zh-CN')
//     expect(info.fromCode).toBe('zh-CN')
//     expect(info.toCode).toBe('en')

//     info = {
//         text: 'app',
//         from: '',
//         to: '',
//         type: 'popup_icon',
//         engine: 'ggTrans__common',
//         mode: 'popup'
//     }
//     await trans.setLangCode({req:info})
//     expect(info.from).toBe('en')
//     expect(info.fromCode).toBe('en')
//     expect(info.toCode).toBe('zh-CN')

//     info = {
//         text: 'app',
//         from: undefined,
//         to: undefined,
//         type: 'popup_icon',
//         engine: 'ggTrans__common',
//         mode: 'popup'
//     }

//     await trans.setLangCode({req:info})
//     expect(info.from).toBe('en')
//     expect(info.fromCode).toBe('en')
//     expect(info.toCode).toBe('zh-CN')
//     expect(info.isDetectedLang).toBe(true)
// })
// //@ts-ignore
// test('translate text test', async (done) => {
//     chrome.storage.sync.set({
//         mainLang: 'zh-CN',
//         secondLang: 'en'
//     })
//     const langs = chrome.storage.sync.get(['mainLang','secondLang'], (res) => {
//         expect(res.mainLang).toBe('zh-CN')
//         expect(res.secondLang).toBe('en')
//     })
//     const trans = new GoogleTrans()
//     const c = await trans.trans({req:{text:'apple', from:'', to:'zh-CN', type: '', mode: '', engine: 'ggTrans__common'}})
//     expect(c.resp?.errMsg).toBe('')
//     expect(c.resp?.data.resultFrom).toEqual('en')
//     expect(c.resp?.data.text).toEqual('苹果')

//     for (let i = 0; i < 9; i++) {
//         await delay(0.4)
//         console.log("trans", i)
//         const c = await trans.trans({req:{text:'apple', from:'', to:'zh-CN', type: '', mode: '', engine: 'ggTrans__common'}})
//         expect(c.resp && c.resp.errMsg).toBe('')
//     }
//     done()
// })