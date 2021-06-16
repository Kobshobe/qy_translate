import {reactive} from 'vue';
import {getOptionOpenParmas, getTreadWord, setTreadWord, isTreadWord} from '@/utils/chromeApi';
import {eventToGoogle} from '@/utils/analytics';
import { ElMessage } from "element-plus";

export default function optionPageHook() {
    const hook = reactive({
        tabsInfo: ["翻译设置", "微信登录"],
        activeTabIndex: 0,
        configInfo: {
            isTreadWord: true,
            info:<any> {},
            changeTreadWord() {
                setTreadWord({data:hook.configInfo.isTreadWord})
                if(!hook.configInfo.isTreadWord) {
                    ElMessage.info({
                        message: "已关闭划词翻译",
                        type: "info",
                      });
                }
            },
        },
        
        async getOpenParams() {
            const openParams = await getOptionOpenParmas();
            if (openParams && openParams.tab === "login") {
                hook.activeTabIndex = 1;
            }
        },
        selectTab(index:number) {
            hook.activeTabIndex = index
            eventToGoogle({
                name: 'tap_tab',
                params: {
                    tabText: hook.tabsInfo[index]
                }
            })
        },
        async init() {
            hook.getOpenParams()
            const treadWordInfo = await getTreadWord()
            hook.configInfo.isTreadWord = isTreadWord(treadWordInfo)
        }
    })

    hook.init()

    return hook
}
