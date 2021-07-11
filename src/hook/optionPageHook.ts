import {onMounted, reactive, onUnmounted} from 'vue';
import {getOptionOpenParmas, getTransConf} from '@/utils/chromeApi';
import {eventToGoogle} from '@/utils/analytics';
import { ElMessage } from "element-plus";
import {IAllStorage, IOptionHook} from '@/utils/interface'


const optionTransMsg = chrome.i18n.getMessage("optionTrans")
const optionLoginMsg = chrome.i18n.getMessage("optionLogin")
const treadWordOff = chrome.i18n.getMessage("treadWordOff")


export default function optionHook():IOptionHook {
    const hook:IOptionHook = reactive({
        tabsInfo: [optionTransMsg, optionLoginMsg],
        activeTabIndex: 0,
        conf: {
            C:<IAllStorage> {},
            changeTransEngine() {
                chrome.storage.sync.set({transEngine: hook.conf.C.transEngine})
                eventToGoogle({
                    name: 'changeTransEngine',
                    params: {
                        value: hook.conf.C.transEngine,
                        scene: 'option'
                    }
                })
            },
            changeMainLang() {
                chrome.storage.sync.set({mainLang: hook.conf.C.mainLang})
                eventToGoogle({
                    name: 'changeMainLang',
                    params: {
                        value: hook.conf.C.mainLang,
                        scene: 'option'
                    }
                })
            },
            changeSecondLang() {
                chrome.storage.sync.set({secondLang: hook.conf.C.secondLang})
                eventToGoogle({
                    name: 'changeSecondLang',
                    params: {
                        value: hook.conf.C.secondLang,
                        scene: 'option'
                    }
                })
            },
            changeTreadWord() {
                chrome.storage.sync.set({isTreadWord:hook.conf.C.isTreadWord})
                if(!hook.conf.C.isTreadWord) {
                    ElMessage.info({
                        message: treadWordOff,
                        type: "info",
                    });
                }
                eventToGoogle({
                    name: 'changeTreadWord',
                    params: {
                        value: hook.conf.C.isTreadWord,
                        scene: 'option'
                    }
                })
            },
            changeMode() {
                chrome.storage.sync.set({mode:hook.conf.C.mode})
                eventToGoogle({
                    name: 'changeMode',
                    params: {
                        value: hook.conf.C.mode,
                        scene: 'option'
                    }
                })
            },
            changeMenuTrans() {
                chrome.storage.sync.set({menuTrans: hook.conf.C.menuTrans})
                if(hook.conf.C.menuTrans) {
                    chrome.contextMenus.create({
                        id: "trans",
                        title: "翻译",
                        contexts: ['selection']
                      })
                } else {
                    chrome.contextMenus.remove('trans')
                }
                eventToGoogle({
                    name: 'changeMenuTrans',
                    params: {
                        value: hook.conf.C.menuTrans,
                        scene: 'option'
                    }
                })
            }
        },
        
        async getOpenParams() {
            const params = await getOptionOpenParmas();
            if (params.optionPageOpenParmas?.tab === "login") {
                hook.activeTabIndex = 1;
            }
            const conf = await getTransConf()
            hook.conf.C = conf
            chrome.storage.sync.remove('optionPageOpenParmas')
        },
        selectTab(index:number) {
            hook.activeTabIndex = index
            eventToGoogle({
                name: 'tap_tab',
                params: {
                    tabText: hook.tabsInfo[index],
                    locale: chrome.i18n.getMessage("@@ui_locale")
                }
            })
        },
        async init() {
            hook.getOpenParams()
        }
    })

    onMounted(() => {
        hook.init()
        // document.addEventListener('visibilitychange', async () => {
        //     hook.getOpenParams()
        // }) 
    })

    return hook
}
