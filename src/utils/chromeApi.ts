import { Mode } from '@/config'
import { ITokenInfo, ITokenInfoFromCloud, IOptionPageOpenParma, IConfigInfo, IAllStorage } from '@/utils/interface'
// @ts-ignore
import { v4 } from "uuid";
import {eventToGoogle} from './analytics'

export async function getFromeStorage(field:string[]) :Promise<any> {
    return new Promise<any>((resolve) => {
        chrome.storage.sync.get(field, (result) => {
            resolve(result)
        })
    })
}


async function checkMainLang() {
    let mainLang = await getMainLang()
    if (!mainLang && navigator.language) {
        mainLang = navigator.language
        setMainLang(navigator.language, "init")
    }
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
        chrome.storage.sync.get(['tokenInfo', 'uuid'], (result: any) => {
            const tokenInfo: ITokenInfo | null = result.tokenInfo
            if(tokenInfo && tokenInfo.openid) {
                resolve("op:" + tokenInfo.openid)
            } else {
                if(result.uuid) {
                    resolve("uuid:"+result.uuid)
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

export function setMainLang(lang: string, scene: string) {
    chrome.storage.sync.set({ mainLang: lang })
    if(scene != "init") {
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

// 打开设置页面
export function openOptionsPage(msg:any) {
    switch (msg.type) {
        case 'login':
            chrome.storage.sync.set({
                optionPageOpenParmas: {
                    tab: 'login'
                }
            })
        case 'applyBDTransDM':
            chrome.storage.sync.set({
                optionPageOpenParmas: {
                    action: 'applyBDTransDM'
                }
            })
    }
    chrome.runtime.openOptionsPage()
    eventToGoogle({
        name: "open_options_page",
        params: {
            type: msg.type
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

export function getOptionOpenParmas(): Promise<IAllStorage> {
    return new Promise<IAllStorage>((resolve, _) => {
        chrome.storage.sync.get(['optionPageOpenParmas', 'isTreadWord'], (result: any) => {
            console.log(result)
            resolve(result)
            // chrome.storage.sync.remove('optionPageOpenParmas')
        })
    })
}

export class Install {
    noFirstInstall() :Promise<boolean> {
        checkMainLang()

        return new Promise<boolean>((resolve, reject) => {
            chrome.storage.sync.get(['noFirstInstall'], (result:any) => {
                if (result.noFirstInstall) {
                    eventToGoogle({
                        name: "onInstall",
                        params:{}
                    })
                    resolve(true)
                } else {
                    this.setInfo()
                    // chrome.tabs.create({url:"https://www.jd.com"})
                    eventToGoogle({
                        name: "firstInstall",
                        params:{}
                    })
                    resolve(false)
                }
            })
        })
    }

    setInfo() {
        chrome.storage.sync.set({noFirstInstall: true})
    }
}

export function bgInit() {
    chrome.storage.sync.get(['bgInit'], (res:any) => {
        const now = new Date().valueOf()
        if (res.bgInit) {
            if (now - res.bgInit.lastToAnalytic < 1800000) return
            chrome.storage.sync.set({
                bgInit: {
                    lastToAnalytic: new Date().valueOf()
                }
            })
            eventToGoogle({
                name: "bg_init",
                params: {}
            })
        } else {
            chrome.storage.sync.set({
                bgInit: {
                    lastToAnalytic: new Date().valueOf()
                }
            })
            eventToGoogle({
                name: "bg_init",
                params: {}
            })
        }
    })
}

export async function openPDFReader(scene:"option"|"actionMenu"|"openLink", link:string='') {
    let url = chrome.runtime.getURL("pdf_viewer/web/index.html")
    let openType = "none"
    if(scene === 'actionMenu') {
        link = await getCurrentTabUrl()
    }
    const len = link.length

    if(len > 4) {
        if(scene === 'openLink') {
            url = url + "?url=" + link
        } else if(link.substr(len-4) === ".pdf") {
            url = url + "?url=" + link
        }
        const s = link.split('://')
        if (s.length > 1) {
            openType = s[0]
        }
    }

    if(scene === 'openLink') {
        window.location.href = url
    } else {
        chrome.tabs.create({url})
    }
    
    eventToGoogle({name: "open_pdf_reader", params: {scene, openType}})
}

function getCurrentTabUrl() :Promise<string> {
    return new Promise<string>((resolve) => {
        chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
            const url = tabs[0].url;
            if (url) {
                resolve(url)
            } else {
                resolve("")
            }
        });
    })
}


export function setTransEngine(engine:string) {
    chrome.storage.sync.set({transEngine:engine})
}