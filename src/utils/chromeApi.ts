import { Mode, TestTokenInfo, client, clientVersion } from '@/config'
import { ITokenInfo, ITokenInfoFromCloud, IOptionPageOpenParma, IConfigInfo } from '@/utils/interface'
// @ts-ignore
import { v4 } from "uuid";
import {eventToGoogle} from './analytics'

export async function init() {
    // console.log("bg_init")
    let mainLang = await getMainLang()
    if (!mainLang && navigator.language) {
        mainLang = navigator.language
        setMainLang(navigator.language)
    }
    eventToGoogle({
        name: 'bg_init',
        params: {
            mainLang
        }
    })
}

export function openPDFReader(scene:"option"|"menu") {
    const url = chrome.runtime.getURL("pdf_viewer/web/index.html")
    chrome.tabs.create({url})
    eventToGoogle({name: "open_pdf_reader", params: {scene}})
}

export function setTreadWord(treadWordInfo:any) {
    return new Promise((resolve) => {
        chrome.storage.sync.set({isTreadWord: treadWordInfo.data})
        eventToGoogle({name:"changeTreadWord", params: {status: treadWordInfo.data}})
    })
}

export function getTreadWord() :Promise<boolean> {
    return new Promise<boolean>((resolve) => {
        chrome.storage.sync.get(['isTreadWord'], (result) => {
            resolve(result.isTreadWord)
        })
    })
}

export function isTreadWord(treadWordInfo: any) :boolean {
    if(treadWordInfo === false) {
        return false
    } else {
        return true
    }
}

export async function getClientId(): Promise<string> {
    return new Promise<string>((resolve) => {
        if(Mode === "jest") {
            resolve("test:xxxxxx-yyyyy")
            return
        }
        chrome.storage.sync.get(['tokenInfo', 'uuid'], (result: any) => {
            const tokenInfo: ITokenInfo | null = result.tokenInfo
            if(tokenInfo && tokenInfo.openid) {
                resolve("op:" + tokenInfo.openid)
            } else {
                if(result.uuid) {
                    resolve("uuid"+result.uuid)
                } else {
                    const uuid = v4()
                    chrome.storage.sync.set({uuid})
                    resolve("nuuid:"+uuid)
                }
            }
        })
    })
}

// 通过runtime.connect的port获取token
export async function getTokenUsePort(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const port: chrome.runtime.Port = chrome.runtime.connect({ name: "getToken" });
        port.postMessage({})
        port.onMessage.addListener(function (token: any) {
            resolve(token)
        })
    })
}

// 从本地存储中获取token
export function getTokenFromStorage(getCheckToken=true): Promise<string> {

    return new Promise<string>((resolve, reject) => {
        if (Mode === 'jest') {
            const check = checkToken(TestTokenInfo)
            if (check === 'needRelogin' || check === 'needLogin') {
                reject(check)
            } else {
                resolve(check)
            }
            return
        }
        chrome.storage.sync.get(['tokenInfo'], (result: any) => {
            const tokenInfo: ITokenInfo | null = result.tokenInfo
            const check = checkToken(tokenInfo)
            if (check === 'needRelogin' || check === 'needLogin') {
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
            return 'needRelogin'
        }
        return tokenInfo.token
    } else {
        return 'needLogin'
    }
}

// 保存token信息
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

// 删除本地存储的tokenInfo
export function removeTokenInfo(callback: Function) {
    chrome.storage.sync.remove('tokenInfo', function () {
        callback()
    });
}

// 通过runtime.connect的port删除token
export async function removeTokenInfoUsePort(): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const port = chrome.runtime.connect({ name: "removeTokenInfo" });
        port.postMessage({});
        port.onMessage.addListener(function (isRemove: boolean) {
            resolve(isRemove)
        });
    });
}

export function getMainLang(): Promise<string> {
    return new Promise((resolve, _) => {
        chrome.storage.sync.get(['mainLang'], (obj: any) => {
            resolve(obj.mainLang)
        })
    })
}

export function getSecondLang(): Promise<string> {
    return new Promise((resolve, _) => {
        chrome.storage.sync.get(['secondLang'], (obj: any) => {
            resolve(obj.secondLang || 'en')
        })
    })
}

export function setMainLang(lang: string) {
    chrome.storage.sync.set({ mainLang: lang })
    eventToGoogle({
        name: 'setMainLang',
        params: {
            lang
        }
    })
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

// 打开设置页面
export function openOptionsPage(msg:any) {
    if (msg.tab === 'login') {
        chrome.storage.sync.set({
            optionPageOpenParmas: {
                tab: 'login'
            }
        })
    }
    chrome.runtime.openOptionsPage()
    eventToGoogle({
        name: "open_options_page",
        params: {
            isToLogin: msg.tab === 'login'
        }
    })
}

// 获取打开设置页面的参数
export function getOptionPageOpenParmasUsePort() {
    return new Promise((resolve, _) => {
        const port = chrome.runtime.connect({ name: "getOptionPageOpenParmas" });
        port.postMessage({});
        port.onMessage.addListener(function (optionPageOpenParmas: any) {
            if (optionPageOpenParmas === null) {
                resolve(null)
                return
            } else {
                resolve(optionPageOpenParmas)
                chrome.storage.sync.remove('optionPageOpenParmas')
            }
        })
    })
}

export function getOptionOpenParmas(): Promise<IOptionPageOpenParma | null> {
    return new Promise<IOptionPageOpenParma | null>((resolve, _) => {
        chrome.storage.sync.get(['optionPageOpenParmas'], (result: any) => {
            resolve(result.optionPageOpenParmas)
            chrome.storage.sync.remove('optionPageOpenParmas')
        })
    })
}