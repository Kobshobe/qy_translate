import { reactive, watch, computed, onMounted } from 'vue'
import { IAllStorage, ITransResult } from '@/utils/interface'
import { newMarkManager, getMarkHtml } from '@/utils/mark'
import {apiWrap} from '@/utils/apiWithPort'
import { IContext, IResponse, ITranslateMsg, ITranslatorHook, Find, IAnalyticEvent, IWrapTransInfo, IConfigInfo } from '@/utils/interface'
import {getTransConf} from '@/utils/chromeApi'
import { engines } from '@/translator/language'

export function baseTransHook(status:string) {
    const hook = {
        status,
    }

    return hook
}


export function transHook(mode: 'resultOnly' | 'popup', status:'result'|'editing' = 'result') {
    const hook: ITranslatorHook = reactive({
        mode,
        status,
        editingText: `take`,
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
                if (!hook.find.result) return
                await hook.usePort({
                    name: 'translate',
                    context: {
                        req: { text: hook.subTranslator.selectText, from: hook.find.result.resultFrom, to: hook.find.result.resultTo, type: 'sub', engine: hook.find.result.engine}
                    },
                    onMsgHandle: (context:IContext) => {
                        hook.subTranslator.resultData = context.resp?.data
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
                        if (hook.subTranslator.status !== "result") hook.subTranslator.status = 'loading';
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
            getData() {
                if(hook.status === 'editing') {
                    hook.options.from = hook.conf.C.fromLang
                    hook.options.to = hook.conf.C.toLang
                } else {
                    if(!hook.find.result) return
                    hook.options.from = hook.find.result.resultFrom
                    hook.options.to = hook.find.result.resultTo
                    //@ts-ignore
                    hook.options.engine = hook.find.result.engine
                }
            },
            async setLang() {
                // console.log('setLang', hook.status, hook.options)
                if(hook.status === 'editing') {
                    chrome.storage.sync.set({
                        fromLang: hook.options.from,
                        toLang: hook.options.to
                    })
                } else if(hook.status === 'result') {
                    await hook.options.close()
                }
            },
            async close() {
                hook.options.isShow = false
                if (
                    hook.options.from !== hook.find.result?.resultFrom ||
                    hook.options.to !== hook.find.result?.resultTo) {
                    // @ts-ignore
                    await hook.trans({ text: hook.find.text, type: 'changeLang', from: hook.options.from, to: hook.options.to, findStatus: 'reLoading' })
                }
            },
            openOptionsPage() {
                hook.usePort({
                    name: 'openOptionsPage',
                    context: {req: { tab: ''}}
                })
            },
            show() {
                if(!hook.find.result) return
                hook.options.getData()
                hook.options.isShow = true
                hook.eventToAnalytic({name: "result_option_show", params: {}})
            },
            async exchange() {
                // [transHook.options.from, transHook.options.to,] = [transHook.options.to,, transHook.options.from,]
                if(hook.status === 'editing') {
                    if(hook.options.from ==='auto' || hook.options.to === 'auto' || hook.options.from ==='__auto__' || hook.options.to === '__auto__') {
                        return
                    }
                    [hook.options.from, hook.options.to] = [hook.options.to, hook.options.from]
                    hook.options.setLang()
                } else {
                    // @ts-ignore
                    await hook.trans({ text: hook.find.result.text, type: 'exchange', from: hook.options.to, to: hook.options.from, findStatus: 'reLoading' })
                    hook.options.isShow = false
                }
                
            },
            async changeEngine() {
                // @ts-ignore
                hook.options.isShow = false
                await hook.trans({ text: hook.find.text, type: 'changeEngine', findStatus: 'reLoading' })
                
            }
        },
        conf: {
            C: {},
            changeTreadWord() {
                if(!hook.conf.C?.isTreadWord) {
                    hook.toast.showToast({type: 'i18n', message: 'treadWordOff'})
                }
                chrome.storage.sync.set({isTreadWord:hook.conf.C.isTreadWord})
                hook.eventToAnalytic({
                    name: 'changeTreadWord',
                    params: {
                        value: hook.conf.C.isTreadWord,
                        scene: 'popup'
                    }
                })
            },
            async getConf() {
                hook.conf.C = await getTransConf()
                hook.options.getData()
            }
        },
        async usePort({ name, context, onMsgHandle }) {
            const port = chrome.runtime.connect({ name: name })
            port.onMessage.addListener((context: IContext) => {
                hook.handleWebErr(context)
                onMsgHandle && onMsgHandle(context)
            })
            await port.postMessage(context)
        },
        handleWebErr(context) {
            if (!context.resp) return
            if(context.resp.tipsMessage) {
                hook.tips.message = chrome.i18n.getMessage(context.resp.tipsMessage)
            } else {
                hook.tips.message = ''
            }
            if (context.resp.errMsg === '__needLogin__' || context.resp.errMsg === '__needRelogin__') {
                hook.dialogMsg.showDialog({
                    type: 'i18n',
                    message: context.resp.errMsg,
                    confirmText: 'scanQR',
                    cancelText: '',
                    confirmAction: () => {
                        hook.usePort({
                        name: 'openOptionsPage',
                        context: {req: { tab: 'login' }},
                    })
                }})
            } 

            else if (context.resp.dialogMsg) {
                hook.dialogMsg.showDialog(context.resp.dialogMsg)
            }
            
            else if (context.resp.toastMsg) {
                hook.toast.showToast(context.resp.toastMsg)
            }
        },
        getMarkHtml() {
            return getMarkHtml(hook.marksList, hook.find.text)
        },
        async updateMark({ success, fail, info }) {
            await hook.usePort({
                name: 'updateMark',
                context: {req:info},
                onMsgHandle: (context: IContext) => {
                    if (context.resp?.status == 200) {
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
                context: {req: { tid: hook.find.tid }},
                onMsgHandle: (context) => {
                    if (!context.resp?.errMsg && context.resp?.status === 200) {
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
                context: {req:{
                    text: hook.find.text,
                    translation: hook.find.result.text,
                    marks: hook.subTranslator.marksStr,
                    resultFrom: hook.find.result.resultFrom,
                    resultTo: hook.find.result.resultTo
                }},
                onMsgHandle: (context) => {
                    if (!context.resp?.errMsg) {
                        hook.find.isCollected = true
                        hook.find.tid = context.resp?.data.tid
                        success && success(context.resp)
                    } else {
                        if (fail) fail({ msg: "needLogin" })
                    }
                }
            })
        },
        async trans({ text, type, findStatus, from, to }) {
            const t = text
            if (t.replace(/\s+|[\r\n]+/g, "").length === 0) {
                return
            }

            console.log(from, to, hook.options)
            if(hook.conf.C.mode !== 'simple') {
                from || (from = hook.options.from);
                to || (to = hook.options.to);
            } else {
                
            }

            console.log(from, to)
            const find = new Find(text)
            hook.show = true;
            if (findStatus) {
                hook.findStatus = findStatus
            }

            await hook.usePort({
                name: 'translate',
                context: {req:{ text: find.text, from, to, type, mode, engine:hook.options.engine }},
                onMsgHandle: (context: IContext) => {
                    console.log('onMsgHandle: ', context)
                    if (!context.resp) return
                    if (context.resp.errMsg) {
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
                    if (!context.resp.data) {
                        hook.findStatus = 'ok'
                        return
                    }
                    hook.status = "result"
                    hook.find = find
                    hook.find.result = context.resp.data;
                    hook.marksList = [];
                    hook.options.getData();
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
            if ((e.code === 'Enter') && (e.ctrlKey || e.shiftKey || e.altKey)) {
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
                context: {req:{ text: text, lang: lang, audioType: audioType}},
                onMsgHandle: (context: IContext) => {
                    console.log('tts: ', context)
                    if (!context.resp || context.resp.errMsg) {
                        return
                    }
                    // @ts-ignore
                    const iframe = hook[`${audioType}Iframe`]
                    iframe.contentWindow.postMessage({
                        source: "phrase",
                        action: "playAudio",
                        audioBase64: context.resp.data,
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
            hook.conf.getConf()
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
                context: {req: eventData},
            })
        },
        getLastFindText() {
            hook.editingText = hook.lastFindText
            hook.eventToAnalytic({
                name: 'getLastFindText',
                params: {}
            })
        },
        async applyBDDM() {
            await hook.usePort({
                name: "applyBDDM",
                context: {req: {}}
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


    hook.conf.getConf()


    return hook
}

