import { reactive, watch, computed, onMounted } from 'vue'
import { ITransResult } from '@/utils/interface'
import { newMarkManager, getMarkHtml } from '@/utils/mark'
import apiWrap from '@/utils/apiWithPort'
import { IRequestResult, ITranslateMsg, ITranslatorHook, Find, IAnalyticEvent, ITransInfo, IConfigInfo } from '@/utils/interface'
import {isTreadWord} from '@/utils/chromeApi'


const copyOKMsg = chrome.i18n.getMessage("copyOK")
const treadWordOffMsg = chrome.i18n.getMessage("treadWordOff")
const needLoginMsg = chrome.i18n.getMessage("needLogin")
const needReloginMsg = chrome.i18n.getMessage("needRelogin")
const scanQRMsg = chrome.i18n.getMessage("scanQR")
const collTooLongMsg = chrome.i18n.getMessage("collTooLong")


export function translatorHook(mode: 'resultOnly' | 'popup', isTest: boolean = false) {
    const translator: ITranslatorHook = reactive({
        mode,
        status: 'result',
        editingText: ``,
        lastFindText: '',
        show: false,
        find: new Find(''),
        findStatus: 'none',
        fromIframe: undefined,
        toIframe: undefined,
        subIfram: undefined,
        dialogMsg: {
            show: false,
            contentText: '',
            confirmText: '',
            cancelText: '',
            confirmAction: undefined,
            showDialog: (contentText, confirmText, cancelText, confirmAction) => {
                translator.dialogMsg.contentText = contentText
                translator.dialogMsg.confirmText = confirmText
                translator.dialogMsg.cancelText = cancelText
                translator.dialogMsg.confirmAction = confirmAction
                translator.dialogMsg.show = true
            }
        },
        toast: {
            show: false,
            msg: '',
            closeTimer: undefined,
            showToast({ msg, duration = 1500 }) {
                clearTimeout(translator.toast.closeTimer)
                translator.toast.show = false
                translator.toast.msg = msg
                translator.toast.show = true
                translator.toast.closeTimer = setTimeout(() => {
                    translator.toast.show = false
                }, duration)
            }
        },
        marksList: [],
        canReduceMark: false,
        subTranslator: {
            status: "hide",
            selectText: '',
            selectRange: [],
            top: 0,
            left: 0,
            isLoading: false,
            resultData: undefined,
            marksStr: '[]',
            async translate() {
                translator.subTranslator.status = 'loading'
                translator.subTranslator.isLoading = true
                await translator.usePort({
                    name: 'translate',
                    msg: { text: translator.subTranslator.selectText, from: translator.find.result?.resultFrom, to: translator.find.result?.resultTo, type: 'sub' },
                    onMsgHandle: (msg: IRequestResult) => {
                        translator.subTranslator.resultData = msg.data
                        translator.subTranslator.status = 'result'
                    }
                })
            },
            afterMark(canReduce: boolean) {
                translator.canReduceMark = canReduce
                if (translator.subTranslator.status !== "result") translator.subTranslator.status = 'hide'
            },
            bookMark() {
                translator.canReduceMark = newMarkManager([translator.subTranslator.selectRange[0], translator.subTranslator.selectRange[1]], translator.marksList).canReduce
            },
            async mark() {
                const markInfo = newMarkManager([translator.subTranslator.selectRange[0], translator.subTranslator.selectRange[1]], translator.marksList)
                translator.subTranslator.marksStr = JSON.stringify(markInfo.newMarksList)
                if (!translator.find.isCollected) {
                    if (markInfo.canReduce) {
                        // 收藏标记后取消收藏，此时取消标记直接取消不触发收藏
                        translator.marksList = markInfo.newMarksList
                        translator.subTranslator.afterMark(markInfo.canReduce)
                    } else {
                        if (translator.subTranslator.status !== "result") translator.subTranslator.status = 'loading'
                        await translator.collect({
                            success: () => {
                                translator.subTranslator.afterMark(!markInfo.canReduce)
                                translator.marksList = markInfo.newMarksList
                            }, fail: () => {
                                translator.subTranslator.afterMark(markInfo.canReduce)
                            }
                        })
                    }

                } else {
                    if (!translator.find.tid) return
                    await translator.updateMark({
                        success: () => {
                            translator.marksList = markInfo.newMarksList
                            translator.subTranslator.afterMark(!markInfo.canReduce)
                        },
                        fail: () => {
                            translator.subTranslator.afterMark(markInfo.canReduce)
                        },
                        info: {
                            tid: translator.find.tid,
                            marks: translator.subTranslator.marksStr
                        }
                    })

                }
            },
            init() {
                translator.subTranslator.status = 'hide'
                translator.subTranslator.isLoading = false
                translator.subTranslator.selectText = ''
            }
        },
        options: {
            isShow: false,
            from: '',
            to: '',
            close() {
                translator.options.isShow = false
                if (translator.options.from !== translator.find.result?.resultFrom || translator.options.to !== translator.find.result?.resultTo) {
                    // @ts-ignore
                    translator.translateText({ text: translator.find.text, type: 'changeLang', from: translator.options.from, to: translator.options.to })
                }
            },
            openOptionsPage() {
                translator.usePort({
                    name: 'openOptionsPage',
                    msg: { tab: '' },
                    onMsgHandle: () => { }
                })
            },
            show() {
                translator.options.isShow = true
                translator.options.from = translator.find.result?.resultFrom
                translator.options.to = translator.find.result?.resultTo
                translator.toAnalytics({name: "result_option_show", params: {}})
            },
            exchange() {
                // [translator.options.from, translator.options.to,] = [translator.options.to,, translator.options.from,]
                // @ts-ignore
                translator.translateText({ text: translator.find.result.text, type: 'exchange', from: translator.options.to, to: translator.options.from })
                translator.options.isShow = false
            }
        },
        configInfo: {
            isTreadWord: true,
            info: {},
            changeTreadWord() {
                if(!translator.configInfo.isTreadWord) {
                    translator.toast.showToast({msg: treadWordOffMsg})
                }
                translator.usePort({
                    name: "setTreadWord",
                    msg: translator.configInfo.isTreadWord,
                    onMsgHandle: () => {}
                })
            },
            getTreadWord() {
            translator.usePort({
                name: "getTreadWord",
                msg: null,
                onMsgHandle: (msg:any) => {

                    translator.configInfo.isTreadWord = isTreadWord(msg)

                    if(msg) translator.configInfo.info = msg
                }
            })
        }
        },
        async usePort({ name, msg, onMsgHandle }) {
            if (isTest) {
                // @ts-ignore
                const resultMsg = await apiWrap[name](msg, null)
                translator.handleWebErr(resultMsg)
                onMsgHandle(resultMsg)
                return
            }
            const port = chrome.runtime.connect({ name: name })
            port.postMessage(msg)
            port.onMessage.addListener((msg: IRequestResult) => {
                translator.handleWebErr(msg)
                onMsgHandle(msg)
            })
        },
        handleWebErr(msg) {
            if (!msg) return
            if (msg.errMsg === 'needLogin' || msg.errMsg === 'needRelogin') {
                let text = needLoginMsg
                if (msg.errMsg === 'needRelogin') {
                    text = needReloginMsg
                }
                translator.dialogMsg.showDialog(text, scanQRMsg, '', () => {
                    translator.usePort({
                        name: 'openOptionsPage',
                        msg: { tab: 'login' },
                        onMsgHandle: () => { }
                    })
                    translator.dialogMsg.show = false
                })
            } else if (msg.toastMsg) {
                translator.toast.showToast({ msg: msg.toastMsg })
            } else if (msg.serveToastMsg) {
                translator.toast.showToast({
                    msg: msg.serveToastMsg
                })
            }
        },
        getMarkHtml() {
            return getMarkHtml(translator.marksList, translator.find.text)
        },
        async updateMark({ success, fail, info }) {
            await translator.usePort({
                name: 'updateMark',
                msg: info,
                onMsgHandle: (msg: IRequestResult) => {
                    if (msg.status == 200) {
                        success()
                    } else {
                        fail()
                    }
                }
            })
        },
        async reduceCollect() {
            await translator.usePort({
                name: 'reduceCollect',
                msg: { tid: translator.find.tid },
                onMsgHandle: (msg: IRequestResult) => {
                    if (!msg.errMsg && msg.status === 200) {
                        translator.find.isCollected = false
                        translator.find.tid = null
                    }
                }
            })
        },
        async collect({ success, fail }) {
            if (!translator.find.result) return
            if (translator.find.text.length > 500 || translator.find.result.text.length > 500) {
                translator.toast.showToast({ msg: collTooLongMsg })
                fail?.call(translator)
                return
            }
            await translator.usePort({
                name: 'collect',
                msg: {
                    text: translator.find.text,
                    translation: translator.find.result.text,
                    marks: translator.subTranslator.marksStr,
                    resultFrom: translator.find.result.resultFrom,
                    resultTo: translator.find.result.resultTo
                },
                onMsgHandle: (msg: IRequestResult) => {
                    if (!msg.errMsg) {
                        translator.find.isCollected = true
                        translator.find.tid = msg.data.tid
                        success && success(msg)
                    } else {
                        if (fail) fail({ msg: "needLogin" })
                    }
                }
            })
        },
        async translateText({ text, from = '', to = '', type, findStatus }) {
            const t = text
            if (t.replace(/\s+|[\r\n]+/g, "").length === 0) {
                return
            }
            const find = new Find(text)
            translator.show = true;
            if (findStatus) {
                translator.findStatus = findStatus
            }

            await translator.usePort({
                name: 'translate',
                msg:<ITransInfo> { text: find.text, from, to, type, mode },
                onMsgHandle: (msg: IRequestResult) => {
                    if (msg.errMsg) return
                    translator.find = find
                    translator.find.result = msg.data;
                    translator.marksList = []
                    translator.status = "result"
                    translator.findStatus = 'ok'
                    translator.subTranslator.init()

                }
            })
        },
        translateFromEdit(e) {
            if (e.code === 'Enter' && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                translator.translateText({ text: translator.editingText, type: 'edit_enter', findStatus: 'loading' })
            }
        },
        getTTS(audioType, id) {
            let text, lang;
            if (!translator.find.result) return
            if (audioType === 'from') {
                text = translator.find.text
                lang = translator.find.result.resultFrom
            } else if (audioType === 'to') {
                text = translator.find.result.text
                lang = translator.find.result.resultTo
            } else if (audioType === 'sub') {
                text = translator.subTranslator.selectText
                lang = translator.find.result.resultFrom
            }
            translator.usePort({
                name: 'tts',
                msg: { text: text, lang: lang },
                onMsgHandle: (res: any) => {
                    // @ts-ignore
                    const iframe = translator[`${audioType}Iframe`]
                    iframe.contentWindow.postMessage({
                        source: "phrase",
                        action: "playAudio",
                        audioBase64: res,
                        id: id
                    }, '*')
                }
            })
        },
        clear() {
            translator.editingText = ''
            translator.eventToAnalytic({
                name: 'clear_edit_text',
                params: {}
            })
        },
        toEdit() {
            translator.lastFindText = translator.editingText
            translator.editingText = ''
            translator.status = 'editing'
            translator.editingText = ''
            translator.eventToAnalytic({
                name: 'to_edit',
                params: {}
            })
        },
        copyResult() {
            const tempInput = document.createElement("input");
            if (!translator.find.result) return
            tempInput.value = translator.find.result.text;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand("copy");
            document.body.removeChild(tempInput);
            translator.toast.showToast({ msg: copyOKMsg, duration: 1000 })
            translator.eventToAnalytic({
                name: 'copy_trans_result',
                params: {
                    len: translator.find.result.text
                }
            })
        },
        eventToAnalytic(eventData) {
            eventData.params.locale = chrome.i18n.getMessage("@@ui_locale")
            translator.usePort({
                name: 'analytic',
                msg: eventData,
                onMsgHandle: () => { }
            })
        },
        toAnalytics(event: IAnalyticEvent) {
            translator.usePort({
                name: "analytic",
                msg: event,
                onMsgHandle: () => {}
            })
        },
        getLastFindText() {
            translator.editingText = translator.lastFindText
            translator.eventToAnalytic({
                name: 'getLastFindText',
                params: {}
            })
        }
    })

    onMounted(() => {
        translator.configInfo.getTreadWord()
    })

    watch(() => translator.subTranslator.selectText, (newVal) => {
        if (newVal !== '') {
            translator.subTranslator.status = 'showGate'
        }
    })

    return translator
}

