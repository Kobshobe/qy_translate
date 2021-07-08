import { reactive, watch, computed, onMounted } from 'vue'
import { ITransResult } from '@/utils/interface'
import { newMarkManager, getMarkHtml } from '@/utils/mark'
import apiWrap from '@/utils/apiWithPort'
import { IRequestResult, ITranslateMsg, ITranslatorHook, Find, IAnalyticEvent, IWrapTransInfo, IConfigInfo } from '@/utils/interface'
import {isTreadWord} from '@/utils/chromeApi'
import { engines } from '@/translator/language'


export function translatorHook(mode: 'resultOnly' | 'popup', isTest: boolean = false) {
    const hook: ITranslatorHook = reactive({
        mode,
        status: 'result',
        editingText: `app`,
        lastFindText: '',
        show: false,
        find: new Find(''),
        findStatus: 'none',
        fromIframe: undefined,
        toIframe: undefined,
        subIfram: undefined,
        dialogMsg: {
            show: false,
            message: '',
            confirmText: '',
            cancelText: '',
            confirmAction: undefined,
            showDialog: ({message, confirmText, cancelText, confirmAction, type}) => {
                hook.dialogMsg.cancelText = ''
                hook.dialogMsg.confirmText = ''
                hook.dialogMsg.confirmAction = undefined
                if (type === 'i18n') {
                    hook.dialogMsg.message = chrome.i18n.getMessage(message)
                    cancelText && (hook.dialogMsg.cancelText = chrome.i18n.getMessage(cancelText));
                    confirmText && (hook.dialogMsg.confirmText = chrome.i18n.getMessage(confirmText));
                    switch (confirmText) {
                        case '__applyServiceFree__':
                            confirmAction = hook.applyBDDM
                    }
                } else {
                    hook.dialogMsg.message = message
                    hook.dialogMsg.cancelText = cancelText
                    hook.dialogMsg.confirmText = confirmText
                }
                if (!hook.dialogMsg.confirmText && !hook.dialogMsg.cancelText) {
                    hook.dialogMsg.cancelText = chrome.i18n.getMessage("__gotIt__")
                }
                hook.dialogMsg.confirmAction = confirmAction
                if(hook.dialogMsg.message) hook.dialogMsg.show = true
            }
        },
        toast: {
            show: false,
            msg: '',
            closeTimer: undefined,
            showToast({type, message, duration=1000}) {
                clearTimeout(hook.toast.closeTimer)
                hook.toast.show = false
                if (type === 'i18n') {
                    hook.toast.msg = chrome.i18n.getMessage(message)
                    if(!hook.toast.msg) return
                } else {
                    hook.toast.msg = message
                }
                hook.toast.show = true
                hook.toast.closeTimer = setTimeout(() => {
                    hook.toast.show = false
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
                hook.subTranslator.status = 'loading'
                hook.subTranslator.isLoading = true
                await hook.usePort({
                    name: 'translate',
                    msg: { text: hook.subTranslator.selectText, from: hook.find.result?.resultFrom, to: hook.find.result?.resultTo, type: 'sub' },
                    onMsgHandle: (msg: IRequestResult) => {
                        hook.subTranslator.resultData = msg.data
                        hook.subTranslator.status = 'result'
                    }
                })
            },
            afterMark(canReduce: boolean) {
                hook.canReduceMark = canReduce
                if (hook.subTranslator.status !== "result") hook.subTranslator.status = 'hide'
            },
            bookMark() {
                hook.canReduceMark = newMarkManager([hook.subTranslator.selectRange[0], hook.subTranslator.selectRange[1]], hook.marksList).canReduce
            },
            async mark() {
                const markInfo = newMarkManager([hook.subTranslator.selectRange[0], hook.subTranslator.selectRange[1]], hook.marksList)
                hook.subTranslator.marksStr = JSON.stringify(markInfo.newMarksList)
                if (!hook.find.isCollected) {
                    if (markInfo.canReduce) {
                        // 收藏标记后取消收藏，此时取消标记直接取消不触发收藏
                        hook.marksList = markInfo.newMarksList
                        hook.subTranslator.afterMark(markInfo.canReduce)
                    } else {
                        if (hook.subTranslator.status !== "result") hook.subTranslator.status = 'loading'
                        await hook.collect({
                            success: () => {
                                hook.subTranslator.afterMark(!markInfo.canReduce)
                                hook.marksList = markInfo.newMarksList
                            }, fail: () => {
                                hook.subTranslator.afterMark(markInfo.canReduce)
                            }
                        })
                    }

                } else {
                    if (!hook.find.tid) return
                    await hook.updateMark({
                        success: () => {
                            hook.marksList = markInfo.newMarksList
                            hook.subTranslator.afterMark(!markInfo.canReduce)
                        },
                        fail: () => {
                            hook.subTranslator.afterMark(markInfo.canReduce)
                        },
                        info: {
                            tid: hook.find.tid,
                            marks: hook.subTranslator.marksStr
                        }
                    })

                }
            },
            init() {
                hook.subTranslator.status = 'hide'
                hook.subTranslator.isLoading = false
                hook.subTranslator.selectText = ''
            }
        },
        options: {
            isShow: false,
            from: '',
            to: '',
            engine: '',
            close() {
                hook.options.isShow = false
                if (
                    hook.options.from !== hook.find.result?.resultFrom ||
                    hook.options.to !== hook.find.result?.resultTo) {
                    // @ts-ignore
                    hook.trans({ text: hook.find.text, type: 'changeLang', from: hook.options.from, to: hook.options.to, findStatus: 'reLoading' })
                }
            },
            openOptionsPage() {
                hook.usePort({
                    name: 'openOptionsPage',
                    msg: { tab: '', type: 'login' }
                })
            },
            show() {
                if(!hook.find.result) return
                hook.options.isShow = true
                hook.options.from = hook.find.result.resultFrom
                hook.options.to = hook.find.result.resultTo
                hook.options.engine = hook.find.result.engine
                hook.toAnalytics({name: "result_option_show", params: {}})
            },
            exchange() {
                // [translator.options.from, translator.options.to,] = [translator.options.to,, translator.options.from,]
                // @ts-ignore
                hook.trans({ text: hook.find.result.text, type: 'exchange', from: hook.options.to, to: hook.options.from, findStatus: 'reLoading' })
                hook.options.isShow = false
            },
            changeEngine() {
                // @ts-ignore
                hook.trans({ text: hook.find.text, type: 'changeEngine', from: hook.options.from, to: hook.options.to, findStatus: 'reLoading' })
                hook.options.isShow = false
            }
        },
        configInfo: {
            isTreadWord: true,
            engine: '',
            info: {},
            changeTreadWord() {
                if(!hook.configInfo.isTreadWord) {
                    hook.toast.showToast({type: 'i18n', message: 'treadWordOff'})
                }
                hook.usePort({
                    name: "setTreadWord",
                    msg: hook.configInfo.isTreadWord,
                    onMsgHandle: () => {}
                })
            },
            getTreadWord() {
            hook.usePort({
                name: 'getTreadWordConf',
                msg: null,
                onMsgHandle: (msg:any) => {

                    hook.configInfo.isTreadWord = isTreadWord(msg)

                    if(msg) hook.configInfo.info = msg
                }
            })
        }
        },
        async usePort({ name, msg, onMsgHandle }) {
            if (isTest) {
                // @ts-ignore
                const resultMsg = await apiWrap[name](msg, null)
                hook.handleWebErr(resultMsg)
                onMsgHandle && onMsgHandle(resultMsg)
                return
            }
            const port = chrome.runtime.connect({ name: name })
            port.postMessage(msg)
            port.onMessage.addListener((msg: IRequestResult) => {
                hook.handleWebErr(msg)
                onMsgHandle && onMsgHandle(msg)
            })
        },
        handleWebErr(msg) {
            if (!msg) return
            if(msg.tipsMessage) {
                hook.tips.message = chrome.i18n.getMessage(msg.tipsMessage)
            } else {
                hook.tips.message = ''
            }
            if (msg.errMsg === '__needLogin__' || msg.errMsg === '__needRelogin__') {
                hook.dialogMsg.showDialog({
                    type: 'i18n',
                    message: msg.errMsg,
                    confirmText: chrome.i18n.getMessage('scanQR'),
                    cancelText: '',
                    confirmAction: () => {
                    hook.usePort({
                        name: 'openOptionsPage',
                        msg: { tab: 'login' },
                        onMsgHandle: () => { }
                    })
                    hook.dialogMsg.show = false
                }})
            } 

            else if (msg.dialogMsg) {
                hook.dialogMsg.showDialog(msg.dialogMsg)
            }
            
            else if (msg.toastMsg) {
                hook.toast.showToast(msg.toastMsg)
            }
        },
        getMarkHtml() {
            return getMarkHtml(hook.marksList, hook.find.text)
        },
        async updateMark({ success, fail, info }) {
            await hook.usePort({
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
            await hook.usePort({
                name: 'reduceCollect',
                msg: { tid: hook.find.tid },
                onMsgHandle: (msg: IRequestResult) => {
                    if (!msg.errMsg && msg.status === 200) {
                        hook.find.isCollected = false
                        hook.find.tid = null
                    }
                }
            })
        },
        async collect({ success, fail }) {
            if (!hook.find.result) return
            if (hook.find.text.length > 500 || hook.find.result.text.length > 500) {
                hook.toast.showToast({ type: 'i18n', message: 'collTooLong' })
                fail?.call(hook)
                return
            }
            await hook.usePort({
                name: 'collect',
                msg: {
                    text: hook.find.text,
                    translation: hook.find.result.text,
                    marks: hook.subTranslator.marksStr,
                    resultFrom: hook.find.result.resultFrom,
                    resultTo: hook.find.result.resultTo
                },
                onMsgHandle: (msg: IRequestResult) => {
                    if (!msg.errMsg) {
                        hook.find.isCollected = true
                        hook.find.tid = msg.data.tid
                        success && success(msg)
                    } else {
                        if (fail) fail({ msg: "needLogin" })
                    }
                }
            })
        },
        async trans({ text, from = '', to = '', type, findStatus }) {
            const t = text
            if (t.replace(/\s+|[\r\n]+/g, "").length === 0) {
                return
            }
            const find = new Find(text)
            hook.show = true;
            if (findStatus) {
                hook.findStatus = findStatus
            }

            await hook.usePort({
                name: 'translate',
                msg:<IWrapTransInfo> { text: find.text, from, to, type, mode, engine:hook.options.engine },
                onMsgHandle: (msg: IRequestResult) => {
                    if (msg.errMsg) {
                        if(hook.findStatus === 'reLoading') {
                            hook.findStatus = 'willOK'
                            setTimeout(() => {
                                if(hook.findStatus === 'willOK') hook.findStatus = 'ok';
                            }, 400)
                        } else {
                            hook.findStatus = 'none'
                        }
                        return
                    }
                    if (!msg.data) {
                        hook.findStatus = 'ok'
                        return
                    }
                    hook.find = find
                    hook.find.result = msg.data;
                    hook.marksList = []
                    hook.status = "result"
                    if(hook.findStatus === 'reLoading') {
                        hook.findStatus = 'willOK'
                        setTimeout(() => {
                            if(hook.findStatus === 'willOK') hook.findStatus = 'ok';
                        }, 400)
                    } else {
                        hook.findStatus = 'ok'
                    }
                    
                    hook.subTranslator.init()

                }
            })
        },
        translateFromEdit(e) {
            if (e.code === 'Enter' && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                hook.trans({ text: hook.editingText, type: 'edit_enter', findStatus: 'loading' })
            }
        },
        getTTS(audioType, id) {
            let text, lang;
            if (!hook.find.result) return
            if (audioType === 'from') {
                text = hook.find.text
                lang = hook.find.result.resultFrom
            } else if (audioType === 'to') {
                text = hook.find.result.text
                lang = hook.find.result.resultTo
            } else if (audioType === 'sub') {
                text = hook.subTranslator.selectText
                lang = hook.find.result.resultFrom
            }
            hook.usePort({
                name: 'tts',
                msg: { text: text, lang: lang, audioType: audioType},
                onMsgHandle: (res: IRequestResult) => {
                    if (res.errMsg) {
                        return
                    }
                    // @ts-ignore
                    const iframe = hook[`${audioType}Iframe`]
                    iframe.contentWindow.postMessage({
                        source: "phrase",
                        action: "playAudio",
                        audioBase64: res.data,
                        id: id
                    }, '*')
                }
            })
        },
        clear() {
            hook.editingText = ''
            hook.eventToAnalytic({
                name: 'clear_edit_text',
                params: {}
            })
        },
        toEdit() {
            hook.lastFindText = hook.editingText
            hook.editingText = ''
            hook.status = 'editing'
            hook.editingText = ''
            hook.eventToAnalytic({
                name: 'to_edit',
                params: {}
            })
        },
        copyResult() {
            const tempInput = document.createElement("input");
            if (!hook.find.result) return
            tempInput.value = hook.find.result.text;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand("copy");
            document.body.removeChild(tempInput);
            hook.toast.showToast({ type: 'i18n', message: 'copyOK' })
            hook.eventToAnalytic({
                name: 'copy_trans_result',
                params: {
                    len: hook.find.result.text
                }
            })
        },
        eventToAnalytic(eventData) {
            eventData.params.locale = chrome.i18n.getMessage("@@ui_locale")
            hook.usePort({
                name: 'analytic',
                msg: eventData,
                onMsgHandle: () => { }
            })
        },
        toAnalytics(event: IAnalyticEvent) {
            hook.usePort({
                name: "analytic",
                msg: event,
                onMsgHandle: () => {}
            })
        },
        getLastFindText() {
            hook.editingText = hook.lastFindText
            hook.eventToAnalytic({
                name: 'getLastFindText',
                params: {}
            })
        },
        applyBDDM() {
            hook.usePort({
                name: "applyBDDM",
            })
        },
        pasteAndTrans() {
            const t = document.createElement("input");
            document.body.appendChild(t);
            t.focus();
            document.execCommand("paste");
            const clipboardText = t.value;
            hook.editingText = clipboardText
            document.body.removeChild(t);
            hook.trans({text: hook.editingText, from: '', to: '', type: 'edit_paste', engine: '', findStatus: 'loading'})
        },
        tips: {
            message: ''
        }
    })

    onMounted(() => {
        hook.configInfo.getTreadWord()
    })

    watch(() => hook.subTranslator.selectText, (newVal) => {
        if (newVal !== '') {
            hook.subTranslator.status = 'showGate'
        }
    })

    return hook
}

