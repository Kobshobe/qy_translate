global.fetch = require('node-fetch');

import { Translator } from '../utils/translator'


const translator = new Translator()

function delay(second:number) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(true), second * 1000)
    })
}

jest.setTimeout(40000);

test('translate text test', async (done) => {
    const msg = await translator.findUseApi({text:'apple', from:'', to:'zh-CN', type: '', mode: ''})
    expect(msg.errMsg).toBe('')
    expect(msg.data.resultFrom).toEqual('en')
    expect(msg.data.text).toEqual('苹果')

    // for (let i = 0; i < 8; i++) {
    //     await delay(0.5)
    //     const msg = await translator.findUseApi('apple', '', 'zh-CN')
    //     expect(msg.errMsg).toBe('')
    // }
    done()
})