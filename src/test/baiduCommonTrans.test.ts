import {BaiduTrans} from '@/translator/baiduTrans'

jest.setTimeout(20000)

test("baidu common trans test", async () => {
    expect(true).toBe(true)
    const trans = new BaiduTrans()
    let lang = await trans.detect('app')
    expect('en').toBe(lang)
    lang = await trans.detect('中文')
    expect('zh-CN').toBe(lang)
    // const resp = await trans.CTrans({text:'apple', from:'auto', to:'zh', engine: '', mode: '', type: ''})
    // console.log(resp)
})