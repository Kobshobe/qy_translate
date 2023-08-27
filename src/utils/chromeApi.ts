import { Mode } from '@/config'
import { ITokenInfo, ITokenInfoFromCloud, IAllStorage } from '@/interface/trans'
import { v4 } from "uuid";
import { eventToGoogle } from './analytics'
import { languages } from '@/translator/trans_base'
import { clientVersion } from '@/config'

export async function getTransConf(): Promise<IAllStorage> {
    const conf: IAllStorage = await getFromeStorage([
        'isTreadWord', 'fromLang', 'toLang', 'mode', 'transEngine', 'showProun', 'keyDownTrans',
        'mainLang', 'secondLang',
    ])
    conf.isTreadWord = dealTreadWord(conf.isTreadWord);
    conf.menuTrans = dealTreadWord(conf.menuTrans);
    conf.showProun = dealTreadWord(conf.showProun)
    conf.fromLang || (conf.fromLang = 'auto');
    conf.toLang || (conf.toLang = '__auto__');
    conf.mode || (conf.mode = 'simple');
    conf.transEngine || (conf.transEngine = 'bdTrans__common');
    conf.keyDownTrans || (conf.keyDownTrans = 'Enter');
    if (!conf.mainLang) {
        [conf.mainLang, conf.secondLang] = setLang();
        eventToGoogle({
            name: 'errConfSetLang',
            params: {}
        })
    }

    return conf
}

function dealTreadWord(isTreadWord: any): boolean {
    if (isTreadWord === false) {
        return false
    } else {
        return true
    }
}

export async function getFromeStorage(field: string[]): Promise<IAllStorage> {
    return new Promise<IAllStorage>((resolve) => {
        chrome.storage.sync.get(field, (result) => {
            resolve(result)
        })
    })
}

export async function getClientId(): Promise<string> {
    return new Promise<string>((resolve) => {
        chrome.storage.sync.get(['tokenInfo', 'uuid'], (result: any) => {
            const tokenInfo: ITokenInfo | null = result.tokenInfo
            if (tokenInfo && tokenInfo.openid) {
                resolve("op:" + tokenInfo.openid)
            } else {
                if (result.uuid) {
                    resolve("uuid:" + result.uuid)
                } else {
                    const uuid = v4()
                    chrome.storage.sync.set({ uuid })
                    resolve("nuuid:" + uuid)
                }
            }
        })
    })
}

export function getTokenFromStorage(getCheckToken = true): Promise<string> {

    return new Promise<string>((resolve, reject) => {
        chrome.storage.sync.get(['tokenInfo'], (result: any) => {
            const tokenInfo: ITokenInfo | null = result.tokenInfo
            const check = checkToken(tokenInfo)
            if (check === '__needRelogin__' || check === '__needLogin__') {
                reject(check)
            } else {
                resolve(check)
            }
        })
    }).then(res => { return res }).catch(res => { return res })
}

function checkToken(tokenInfo: ITokenInfo | null): string {
    if (tokenInfo) {
        const now = new Date().getTime()
        if (now - tokenInfo.saveTime + 1800 > tokenInfo.liveTime) {
            return '__needRelogin__'
        }
        return tokenInfo.token
    } else {
        return '__needLogin__'
    }
}

export function saveTokenInfo(info: ITokenInfoFromCloud, callBack: Function) {
    const now = new Date()
    const tokenInfo: ITokenInfo = {
        saveTime: now.getTime(),
        token: info.token,
        liveTime: info.liveTime * 3600 * 1000,
        openid: info.openid
    }
    chrome.storage.sync.set({ tokenInfo: tokenInfo }, function () {
        callBack()
    });
}

export function removeTokenInfo(callback: Function) {
    chrome.storage.sync.remove('tokenInfo', function () {
        callback()
    });
}

export function setMainLang(lang: string, scene: string) {
    chrome.storage.sync.set({ mainLang: lang })
    if (scene != "init") {
        eventToGoogle({
            name: 'setMainLang',
            params: {
                lang,
                scene
            }
        })
    }

}

export function setSecondLang(lang: string) {
    chrome.storage.sync.set({ secondLang: lang })
    eventToGoogle({
        name: 'setSecondLang',
        params: {
            lang
        }
    })
}

export function openOptionsPage(msg: any) {
    chrome.storage.sync.set({
        optionPageOpenParmas: msg
    }, () => {
        chrome.runtime.openOptionsPage()
        eventToGoogle({
            name: "open_options_page",
            params: msg
        })
    })
}

export function getOptionOpenParmas(): Promise<IAllStorage> {
    return new Promise<IAllStorage>((resolve, _) => {
        chrome.storage.sync.get(['optionPageOpenParmas'], (result: any) => {
            resolve(result)
            // chrome.storage.sync.remove('optionPageOpenParmas')
        })
    })
}

export function onInstall(details: any) {
    let reason = 'unknown'
    if (details.reason === 'install') {
        chrome.tabs.create({ url: "https://www.fishfit.fun/bqy/web/install" })
        chrome.storage.sync.set({ installTime: new Date().valueOf() })
        reason = 'install'
    } else {
        reason = details.reason + '_' + clientVersion
        reason = reason.replace(/\./g, '_')
    }
    eventToGoogle({
        name: reason,
        params: {
            previousVersion: details.previousVersion
        }
    })

    checkLang()
}

export function bgInit() {
    // _mark add conf data
    chrome.storage.sync.get(['bgInit', 'mode', 'mainLang', 'secondLang', 'showProun', 'isTreadWord', 'transEngine', 'keyDownTrans'], (res: any) => {
        const now = new Date().valueOf()
        if (!res.mode) res.mode = 'noset'
        if (res.bgInit) {
            if (now - res.bgInit < 600000) return
            chrome.storage.sync.set({
                bgInit: new Date().valueOf()
            })
            eventToGoogle({
                name: "bg_init",
                params: {
                    transMode: res.mode,
                    mainLang: res.mainLang,
                    secondLang: res.secondLang,
                    showProun: res.showProun,
                    isTreadWord: res.isTreadWord,
                    transEngine: res.transEngine,
                    keyDownTrans: res.keyDownTrans,
                    wrap: `${res.mode}_${res.mainLang}_${res.secondLang}_${res.showProun}_${res.isTreadWord}_${res.transEngine}_${res.keyDownTrans}`
                }
            })
        } else {
            chrome.storage.sync.set({
                bgInit: {
                    lastToAnalytic: new Date().valueOf()
                }
            })
            eventToGoogle({
                name: "bg_init",
                params: {
                    transMode: res.mode,
                    mainLang: res.mainLang,
                    secondLang: res.secondLang,
                    showProun: res.showProun,
                    isTreadWord: res.isTreadWord,
                    transEngine: res.transEngine,
                    keyDownTrans: res.keyDownTrans,
                    wrap: `${res.mode}_${res.mainLang}_${res.secondLang}_${res.showProun}_${res.isTreadWord}_${res.transEngine}_${res.keyDownTrans}`
                }
            })
        }
    })
}

export async function openPDFReader(scene: "option" | "actionMenu" | "openLink", link: string = '') {
    let url = chrome.runtime.getURL("pdf_viewer/web/index.html")
    let openType = "none"
    if (scene === 'actionMenu') {
        link = await getCurrentTabUrl()
    }
    const len = link.length

    if (len > 4) {
        if (scene === 'openLink') {
            url = url + "?url=" + link
        } else if (link.substr(len - 4) === ".pdf") {
            url = url + "?url=" + link
        }
        const s = link.split('://')
        if (s.length > 1) {
            openType = s[0]
        }
    }

    if (scene === 'openLink') {
        window.location.href = url
    } else {
        chrome.tabs.create({ url })
    }

    eventToGoogle({ name: "open_pdf_reader", params: { scene, openType } })
}

function getCurrentTabUrl(): Promise<string> {
    return new Promise<string>((resolve) => {
        chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
            const url = tabs[0].url;
            if (url) {
                resolve(url)
            } else {
                resolve("")
            }
        });
    })
}

export function checkLang() {
    chrome.storage.sync.get(['mainLang'], (res) => {
        if (!res.mainLang) {
            const [mainLang, secondLang] = setLang()
            eventToGoogle({
                name: 'firstSetLang',
                params: {
                    mainLang,
                    secondLang,
                }
            })
        }

    })
}

function setLang(): string[] {
    let secondLang: string;
    let mainLang: string
    const lang = navigator.language
    if (lang === 'zh-CN' || lang === 'zh') {
        mainLang = 'zh-CN';
    } else if (lang === 'zh-TW' || lang === 'zh-HK') {
        mainLang = 'zh-TW';
    } else {
        //@ts-ignore
        if (languages[lang]) {
            mainLang = lang
        } else {
            mainLang = 'en'
        }
    }
    if (mainLang !== 'en') {
        secondLang = 'en'
    } else {
        secondLang = 'zh-CN'
    }
    chrome.storage.sync.set({ mainLang, secondLang })
    return [mainLang, secondLang]
}