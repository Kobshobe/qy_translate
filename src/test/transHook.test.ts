// global.fetch = require('node-fetch');
// import {transHook} from '@/hook/translatorHook'
// import {Mode} from '@/config'
// import {removeTokenInfo} from '@/utils/chromeApi'
// import {notest} from './utils'

// jest.setTimeout(10000)

// notest('test translate hook',async () => {
//     // expect.assertions(4)
//     expect(Mode).toBe('jest')
//     let trans = transHook('popup')
//     // 翻译
//     trans.editingText = 'apple'
//     expect(trans.editingText).toBe('apple')
//     await trans.trans({text:'apple', type: 'popup_icon'})
//     expect(trans.find.result?.text).toBe('apple')
//     chrome.storage.sync.set({
//         mainLang: 'zh-CN',
//         secondLang: 'en'
//     })
//     const langs = chrome.storage.sync.get(['mainLang','secondLang'], (res) => {
//         expect(res.mainLang).toBe('zh-CN')
//         expect(res.secondLang).toBe('en')
//     })
//     trans = transHook('popup')
//     //@ts-ignore
//     await chrome.sleep(200)
//     await trans.trans({text:'apple', type: 'popup_icon'})
//     expect(trans.find.result?.text).toBe('苹果')
//     // 收藏
//     await trans.collect({
//         success: (res:any) => {
//             expect(res.status).toBe(201)
//             expect(trans.find.tid).toBe(res.data.tid)
//         }
//     })
//     expect(trans.find.isCollected).toBe(true)
//     // 取消收藏
//     await trans.reduceCollect()
//     expect(trans.find.isCollected).toBe(false)
//     // 标记同时收藏
//     trans.subTranslator.selectRange = [0,4] // 客户选取了前面4个字符'appl'
//     trans.subTranslator.selectText = trans.find.text.slice(0, 4)
//     trans.subTranslator.bookMark()
//     expect(trans.canReduceMark).toBe(false)
//     await trans.subTranslator.mark()
//     expect(trans.find.isCollected).toBe(true)
//     expect(trans.marksList).toEqual([[0,4]])
//     expect(trans.subTranslator.status).toBe('hide')
//     // 取消对最后一个字符的标记
//     trans.subTranslator.selectRange = [3,4]
//     trans.subTranslator.selectText = trans.find.text.slice(3, 4)
//     trans.subTranslator.bookMark()
//     expect(trans.canReduceMark).toBe(true)
//     await trans.subTranslator.mark()
//     expect(trans.marksList).toEqual([[0,3]])

//     // 取消收藏后取消标记不会触发收藏
//     await trans.reduceCollect()
//     expect(trans.find.isCollected).toBe(false)
//     trans.subTranslator.selectRange = [0,3] // 客户选取了前面3个字符'appl'
//     trans.subTranslator.selectText = trans.find.text.slice(0, 3)
//     trans.subTranslator.bookMark()
//     expect(trans.canReduceMark).toBe(true)
//     await trans.subTranslator.mark()
//     expect(trans.find.isCollected).toBe(false)

//     // 未登录点收藏
//     removeTokenInfo(()=> {})
//     trans.subTranslator.selectRange = [0,3] // 客户选取了前面3个字符'app'
//     trans.subTranslator.selectText = trans.find.text.slice(0, 3)
//     trans.subTranslator.bookMark()
//     expect(trans.canReduceMark).toBe(false)
//     await trans.subTranslator.mark()
//     expect(trans.find.isCollected).toBe(false)
//     expect(trans.marksList).toEqual([])
//     expect(trans.subTranslator.status).toBe('hide')
//     expect(trans.dialogMsg.show).toBe(true)
//     expect(trans.dialogMsg.confirmText).toBe('扫码登录')

//     // 子翻译 app
//     //@ts-ignore
//     chrome.setTestToken()
//     trans.subTranslator.selectRange = [0,3] // 客户选取了前面3个字符'app'
//     trans.subTranslator.selectText = trans.find.text.slice(0, 3)
//     await trans.subTranslator.translate()
//     expect(trans.subTranslator.status).toBe('result')
//     expect(trans.subTranslator.resultData?.text).toBe('应用程序')
// })

// notest('sub trans test', async () => {
//     const trans = transHook('popup')
//     // 翻译
//     trans.editingText = 'look This'
//     expect(trans.editingText).toBe('look This')
//     await trans.trans({text:'look This', from:'en', to:'zh-CN', type: 'test'})
//     expect(trans.find.result?.text).toBe('看看这个')

//     // 子翻译
//     trans.subTranslator.selectRange = [0,4] // 客户选取了前面4个字符'look'
//     trans.subTranslator.selectText = trans.find.text.slice(0, 4)
//     await trans.subTranslator.translate()
//     expect(trans.subTranslator.status).toBe('result')
//     expect(trans.subTranslator.resultData?.text).toBe('看')
//     expect(trans.subTranslator.resultData?.sPronunciation).not.toBe('')
//     expect(trans.subTranslator.resultData?.sPronunciation).not.toBe(undefined)
//     expect(trans.subTranslator.resultData?.data.dict.length).toBe(2)
//     expect(trans.subTranslator.resultData?.data.examples.example.length).toBeGreaterThan(2)
// })

// test('change trans change mode and engine', async () => {
//     // expect(Mode).not.toBe('jest')
//     chrome.storage.sync.set({
//         mainLang: 'zh-CN',
//         secondLang: 'en'
//     })
//     const langs = chrome.storage.sync.get(['mainLang','secondLang'], (res) => {
//         expect(res.mainLang).toBe('zh-CN')
//         expect(res.secondLang).toBe('en')
//     })
//     let trans = transHook('popup', 'editing')
//     expect(trans.status).toBe('editing')
//     //@ts-ignore
//     await chrome.sleep(20)
//     await trans.trans({text:'apple', type: 'popup_icon'})
//     expect(trans.find.result?.text).toBe('苹果')
//     expect(trans.find.result?.engine).toBe('ggTrans__common')
//     //@ts-ignore exchange trans
//     await chrome.sleep(200)
//     trans.options.show()
//     await trans.options.exchange()
//     expect(trans.find.result?.text).toBe('apple')
//     expect(trans.find.text).toBe('苹果')
//     //@ts-ignore change lang
//     await chrome.sleep(200)
//     trans.options.to = 'ja'
//     await trans.options.setLang()
//     expect(trans.find.result?.resultTo).toBe('ja')
//     expect(trans.find.result?.text).toBe('林檎')
//     //@ts-ignore change mode
//     await chrome.sleep(200)
//     expect(trans.conf.C.mode).toBe('simple')
//     console.log(trans.conf.C)
//     chrome.storage.sync.set({mode:'profession'})
//     trans = transHook('popup', 'editing')
//     //@ts-ignore
//     await trans.conf.getConf()
//     expect(trans.status).toBe('editing')
//     console.log(chrome.storage.sync.get(['mode'], () => {}))
//     expect(trans.conf.C.mode).toBe('profession')
//     expect(trans.options.from).toBe('auto')
    


//     // await trans.applyDomainTrans()
//     // expect(trans.dialogMsg.message).toBe('恭喜你申请成功!')
//     // trans.options.show()
//     // trans.options.engine = 'bdDM__finance'
//     // await trans.options.changeEngine()
//     // expect(trans.findStatus).toBe('willOK')
//     // expect(trans.find.result?.text).toBe('苹果')
//     // expect(trans.toast.msg).toBe('')
//     // expect(trans.find.result?.engine).toBe('bdDM__finance')
// })