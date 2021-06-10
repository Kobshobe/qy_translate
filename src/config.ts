
export const Mode:'test'|'jest'|'public'|'public_test' = 'public_test'
export const clientVersion = "1.1.5"
export const _client:'chrome'|'edge' = "chrome"
export const client:string = getClient()
export const os:'mac'|'windows'|'linux'|'unknow' = getOS()
export const storeUrl = 'https://www.fishfit.fun:8080/p/web/download/option'

const tokenInfo = {
    token: 'eyJhbGciOiJIAiOjE2MjQ1NDg2MzcsInVpZCI6I',
    saveTime: new Date().getTime(),
    liveTime: 100000000000,
    openid: "testopenid"
}

export let TestTokenInfo:any = tokenInfo

export function setTestTokenToNull(logout:boolean) {
    if(logout) {
        TestTokenInfo = null
    } else {
        TestTokenInfo = tokenInfo
    }
}

export const googleAnalytic = {
    measurementId: `G-4XZ65P0G94`,
    apiSecret: `G1uxYlc7QgaWUOMbbk7MSA`
}

export function getClient():string {
    const userAgent = navigator.userAgent

    if(userAgent.indexOf("Edg") > -1) {
        return _client + "_E"
    } else if(userAgent.indexOf("Chrome") > -1) {
        return _client + '_C'
    } else {
        return _client + '_U'
    }
}

export function getOS() :'mac'|'windows'|'linux'|'unknow' {
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
