import {BaiduTrans} from '@/translator/baiduTrans'
import {Context} from '@/api/context'

jest.setTimeout(20000)

test("baidu common trans test", async () => {
    expect(true).toBe(true)
    const trans = new BaiduTrans()
    const c = new Context({text:'apple', from:'auto', to:'zh-CN', engine: '', mode: '', type: ''})
    await trans.CTrans(c)
})