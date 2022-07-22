import {baseFetch} from '@/api/api'

jest.setTimeout(40000);

test('baidu trans test', async () => {
    await baidu()
})

async function baidu() {
    let resp = await baseFetch({
        url: "https://www.fishfit.fun/p/ping",
        method: "get",
    })
    console.log(resp.data)

    let tres = await baseFetch({
        url: 'https://cn.bing.com/dict/clientsearch?mkt=zh-CN&setLang=zh&form=BDVEHC&ClientVer=BDDTV3.5.1.4320&q=app',
        method: 'get',
    })
    console.log(tres.data)
}