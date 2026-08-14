import {IClientInfo} from '@/interface/trans'
import manifest from '@/background/manifest.json'

export const Mode:'test'|'jest'|'public'|'public_test' = 'public'
/** 发行包的目标商店（发行渠道，非用户浏览器；浏览器由 getClient() 的 _E/_C 后缀区分）。
 *  编译期注入：`VUE_APP_STORE=chrome pnpm build` 或 `pnpm build:chrome`；未指定平台（本地
 *  调试构建，如 `pnpm build`）时为 'debug' —— options 页据此显示 debug 标签（ui/rule-lab）。 */
export const platform:'chrome'|'edge'|'debug' =
  process.env.VUE_APP_STORE === 'chrome'
    ? 'chrome'
    : process.env.VUE_APP_STORE === 'edge'
      ? 'edge'
      : 'debug'
export const clientVersion = manifest.version

/** 默认翻译引擎（单一来源，设置页显示与实际翻译回退保持一致） */
export const defaultTransEngine = 'bing__common'

export const client:IClientInfo = getClient()
export const os:'mac'|'windows'|'linux'|'unknow' = getOS()
export const initZIndex = 100000000;

//@ts-ignore
export const store = platform === 'chrome' ?
'https://chrome.google.com/webstore/detail/fjldhjdclpmehigldnbgbllchcjdgccc' :
'https://microsoftedge.microsoft.com/addons/detail/%E8%BD%BB%E6%B0%A7%E7%BF%BB%E8%AF%91/gldjnohpkhoipopkgkoepimoaoekhioo';

/** 卸载扩展时打开的页面：发送 GA 事件后跳转问卷
 *  @param params 额外参数（版本号 cv、使用时长 usage 等） */
export function getUninstallUrl(params: Record<string, string> = {}) {
    const qs = new URLSearchParams({ platform, ...params }).toString()
    return `https://algoten.com/qy_trans/uninstall.html?${qs}`
}

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
