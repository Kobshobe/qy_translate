import {IClientInfo} from '@/interface/trans'

export const Mode:'test'|'jest'|'public'|'public_test' = 'public'
export const clientVersion = "2.0.6" // manifest.json
export const platform:'chrome'|'edge' = 'chrome'
export const client:IClientInfo = getClient()
export const os:'mac'|'windows'|'linux'|'unknow' = getOS()
export const storeUrl = 'https://www.fishfit.fun/bqy/web/download/option'
export let baseURL:string
export let baseWs:string
export const initZIndex = 100000000;

//@ts-ignore
if (Mode === 'test' || Mode === 'jest') {
    baseURL = 'http://localhost:7600/bqy/papi'
    baseWs = 'ws://localhost:7600/bqy/papi'
} else {
    baseURL = 'https://www.fishfit.fun/bqy/papi'
    baseWs = 'wss://www.fishfit.fun/bqy/papi'
}


//@ts-ignore
export const store = platform === 'chrome' ?
'https://chrome.google.com/webstore/detail/fjldhjdclpmehigldnbgbllchcjdgccc' :
'https://microsoftedge.microsoft.com/addons/detail/%E8%BD%BB%E6%B0%A7%E7%BF%BB%E8%AF%91/gldjnohpkhoipopkgkoepimoaoekhioo';

export const googleAnalytic = {
    measurementId: `G-4XZ65P0G94`,
    apiSecret: `G1uxYlc7QgaWUOMbbk7MSA`
}

export function getClient() :IClientInfo {
    if (Mode === 'jest') {
        return {
            c: 'platform_U',
            os: "UNKNOW",
            l: 'en-US',
            cv: 'v1.0.0',
            st: 'userAgent'
        }
    }
    const userAgent = navigator.userAgent
    const info = {
        c: platform + '_U',
        os: "UNKNOW",
        l: navigator.language,
        cv: clientVersion,
        st: userAgent
    }

    if(userAgent.indexOf("Edg") > -1) {
        info.c = platform + "_E"
    } else if(userAgent.indexOf("Chrome") > -1) {
        info.c = platform + '_C'
    }

    if(userAgent.indexOf("Mac") > -1) {
        info.os = "mac"
    } else if(userAgent.indexOf("Windows") > -1) {
        info.os = 'windows'
    } else if(userAgent.indexOf("Linux") > -1) {
        info.os = 'linux'
    }
    return info
}

export function getOS() :'mac'|'windows'|'linux'|'unknow' {
    if (Mode === 'jest') {
        return 'unknow'
    }
    const userAgent = navigator.userAgent
    if(userAgent.indexOf("Mac") > -1) {
        return "mac"
    } else if(userAgent.indexOf("Windows") > -1) {
        return 'windows'
    } else if(userAgent.indexOf("Linux") > -1) {
        return 'linux'
    } else {
        return "unknow"
    }
}
