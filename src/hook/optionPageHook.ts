import {onMounted, reactive, onUnmounted} from 'vue';
import {getOptionOpenParmas, getTreadWord, setTreadWord, isTreadWord} from '@/utils/chromeApi';
import {eventToGoogle} from '@/utils/analytics';
import { ElMessage } from "element-plus";


const optionTransMsg = chrome.i18n.getMessage("optionTrans")
const optionLoginMsg = chrome.i18n.getMessage("optionLogin")
const treadWordOff = chrome.i18n.getMessage("treadWordOff")


export default function optionPageHook() {
    const hook = reactive({
        tabsInfo: [optionTransMsg, optionLoginMsg],
        activeTabIndex: 0,
        configInfo: {
            isTreadWord: true,
            info:<any> {},
            changeTreadWord() {
                setTreadWord({data:hook.configInfo.isTreadWord})
                if(!hook.configInfo.isTreadWord) {
                    ElMessage.info({
                        message: treadWordOff,
                        type: "info",
                      });
                }
            },
        },

        DMTrans: {
            applyDialog: false
        },
        
        async getOpenParams() {
            const storage = await getOptionOpenParmas();
            if (!storage) return
            if (storage.optionPageOpenParmas?.tab === "login") {
                hook.activeTabIndex = 1;
            }
            hook.configInfo.isTreadWord = storage.isTreadWord
            if(storage.optionPageOpenParmas?.action === 'applyBDTransDM') {
                hook.DMTrans.applyDialog = true
            }
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
        document.addEventListener('visibilitychange', async () => {
            hook.getOpenParams()
        }) 
    })

    return hook
}
