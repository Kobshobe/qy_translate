global.fetch = require('node-fetch');
import {translatorHook} from '@/hook/translatorHook'
import {Mode} from '@/config'
import {removeTokenInfo} from '@/utils/chromeApi'

test('hook test translate',async () => {
    // expect.assertions(4)
    expect(Mode).toBe('jest')
    const trans = translatorHook('popup', true)
    // 翻译
    trans.editingText = 'apple'
    expect(trans.editingText).toBe('apple')
    await trans.translateText({text:'apple', from: 'en', to:'zh-CN', type: 'test'})
    expect(trans.find.result?.text).toBe('苹果')
    // 收藏
    await trans.collect({
        success: (res:any) => {
            expect(res.status).toBe(201)
            expect(trans.find.tid).toBe(res.data.tid)
        }
    })
    expect(trans.find.isCollected).toBe(true)
    // 取消收藏
    await trans.reduceCollect()
    expect(trans.find.isCollected).toBe(false)
    // 标记同时收藏
    trans.subTranslator.selectRange = [0,4] // 客户选取了前面4个字符'appl'
    trans.subTranslator.selectText = trans.find.text.slice(0, 4)
    trans.subTranslator.bookMark()
    expect(trans.canReduceMark).toBe(false)
    await trans.subTranslator.mark()
    expect(trans.find.isCollected).toBe(true)
    expect(trans.marksList).toEqual([[0,4]])
    expect(trans.subTranslator.status).toBe('hide')
    // 取消对最后一个字符的标记
    trans.subTranslator.selectRange = [3,4]
    trans.subTranslator.selectText = trans.find.text.slice(3, 4)
    trans.subTranslator.bookMark()
    await trans.subTranslator.mark()
    expect(trans.marksList).toEqual([[0,3]])

    // 取消收藏后取消标记不会触发收藏
    await trans.reduceCollect()
    expect(trans.find.isCollected).toBe(false)
    trans.subTranslator.selectRange = [0,3] // 客户选取了前面3个字符'appl'
    trans.subTranslator.selectText = trans.find.text.slice(0, 3)
    trans.subTranslator.bookMark()
    expect(trans.canReduceMark).toBe(true)
    await trans.subTranslator.mark()
    expect(trans.find.isCollected).toBe(false)

    // 未登录点收藏
    removeTokenInfo(()=> {})
    trans.subTranslator.selectRange = [0,3] // 客户选取了前面3个字符'app'
    trans.subTranslator.selectText = trans.find.text.slice(0, 3)
    trans.subTranslator.bookMark()
    expect(trans.canReduceMark).toBe(false)
    await trans.subTranslator.mark()
    expect(trans.find.isCollected).toBe(false)
    expect(trans.marksList).toEqual([])
    expect(trans.subTranslator.status).toBe('hide')
    expect(trans.dialogMsg.show).toBe(true)
    expect(trans.dialogMsg.confirmText).toBe('扫码登录')

    // 子翻译 app
    //@ts-ignore
    chrome.setTestToken()
    trans.subTranslator.selectRange = [0,3] // 客户选取了前面3个字符'app'
    trans.subTranslator.selectText = trans.find.text.slice(0, 3)
    await trans.subTranslator.translate()
    expect(trans.subTranslator.status).toBe('result')
    expect(trans.subTranslator.resultData?.text).toBe('应用程序')
})

test('sub trans test', async () => {
    const trans = translatorHook('popup', true)
    // 翻译
    trans.editingText = 'look This'
    expect(trans.editingText).toBe('look This')
    await trans.translateText({text:'look This', from:'en', to:'zh-CN', type: 'test'})
    expect(trans.find.result?.text).toBe('看看这个')

    // 子翻译
    trans.subTranslator.selectRange = [0,4] // 客户选取了前面4个字符'look'
    trans.subTranslator.selectText = trans.find.text.slice(0, 4)
    await trans.subTranslator.translate()
    expect(trans.subTranslator.status).toBe('result')
    expect(trans.subTranslator.resultData?.text).toBe('看')
    expect(trans.subTranslator.resultData?.srcTranslit).not.toBe('')
    expect(trans.subTranslator.resultData?.srcTranslit).not.toBe(undefined)
    expect(trans.subTranslator.resultData?.data.dict.length).toBe(2)
    expect(trans.subTranslator.resultData?.data.examples.example.length).toBeGreaterThan(2)
})