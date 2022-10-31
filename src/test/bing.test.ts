import {BingTrans} from '@/translator/bingTrans';
import {IContext,IWrapTransInfo, ITransResult, IResponse} from '@/interface/trans'

test('bing test', async () => {
    // [, res] = `><div id="rich_tta" data-iid="(.+)" class=" ttastable><table>"`.match(/<div id="rich_tta" data-iid="(.+)"/)
    // console.log(res)

    // const s = `><div id="rich_tta" data-iid="translator.11111" class=" ttastable><table>`
    // const [,res] = s.match(/<div id="rich_tta" data-iid="(.+?)"/)
    // console.log(res)

    const trans = new BingTrans()
    expect(trans.test()).toBe(true)

    const ctx = <IContext>{}
    await trans.getToken()
    console.log(trans.IG, trans.key, trans.token, trans.IID)
    expect(trans.IG).not.toBe("");

    await trans.trans("", "", "")
})