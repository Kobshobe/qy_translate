import {IClientInfo} from '@/interface/trans'
export const Mode:'test'|'jest'|'public'|'public_test' = 'public'
export const clientVersion = "1.7.2"
export const platform:'chrome'|'edge'|'crx'|'crx_v2'|'_test' = "chrome"
export const client:IClientInfo = getClient()
export const os:'mac'|'windows'|'linux'|'unknow' = getOS()
export const storeUrl = 'https://www.fishfit.fun:8080/p/web/download/option'
export const reqTimeout = 10000
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
