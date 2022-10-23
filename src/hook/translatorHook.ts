import { reactive, watch, computed, markRaw, watchEffect } from 'vue'
import { IBaseHook } from '@/interface/trans'
import { newMarkManager, getMarkHtml } from '@/utils/mark'
import { ITransEngine, ITransStatus, IEditHook, ITransMode, IContext, ITransMsg, ITranslatorHook, Find } from '@/interface/trans'
import { getTransConf } from '@/utils/chromeApi'
import {BaiduTrans} from '@/translator/baiduTrans'

export function baseTransHook(mode: ITransMode, status: ITransStatus): IBaseHook {
    const hook: IBaseHook = reactive({
        mode,
        isResultInit: false,
        status,
        findStatus: 'none',
        transID: 0,
        isHold: false,
        bridge: markRaw({}),
        lockLang: false,
        C: {},
        init(mode, status) {
            hook.mode = mode
            hook.status = status
            hook.getConf()
        },
        async getConf() {
            hook.C = await getTransConf()
        },
        changeTreadWord() {
            if (!hook.C.isTreadWord) {
                hook.toast.showToast({ type: 'i18n', message: 'treadWordOff' })
            }
            chrome.storage.sync.set({ isTreadWord: hook.C.isTreadWord })
            hook.eventToAnalytic({
                name: 'changeTreadWord',
                params: {
                    value: hook.C.isTreadWord,
                    scene: hook.mode
                }
            })
        },
        exchangeLang() {
            if (hook.C.toLang === '__auto__' || hook.C.fromLang === 'auto') {
                hook.toast.showToast({
                    message: '__cannotDoIt__',
                    type: 'i18n'
                })
                return
            }
            [hook.C.fromLang, hook.C.toLang] = [hook.C.toLang, hook.C.fromLang]
            hook.changeLang(true)
        },
        changeLang(isExchange: boolean = false) {
            if (hook.status === 'result') return
            chrome.storage.sync.set({
                fromLang: hook.C.fromLang,
                toLang: hook.C.toLang
            })
            hook.eventToAnalytic({
                name: 'changeLang',
                params: {
                    fromLang: hook.C.fromLang,
                    toLang: hook.C.toLang,
                    isExchange,
                    scene: hook.mode,
                }
            })
        },
        openOptionsPage(type: string) {
            hook.usePort({
                name: 'openOptionsPage',
                context: { req: { tab: '', type } }
            })
        },
        dialog: {
            show: false,
            message: '',
            confirmText: '',
            cancelText: '',
            confirmAction: undefined,
            showDialog: ({ message, confirmText, cancelText, confirmAction, type }) => {
                hook.dialog.cancelText = ''
                hook.dialog.confirmText = ''
                hook.dialog.confirmAction = undefined
                if (type === 'i18n') {
                    hook.dialog.message = chrome.i18n.getMessage(message)
                    cancelText && (hook.dialog.cancelText = chrome.i18n.getMessage(cancelText));
                    confirmText && (hook.dialog.confirmText = chrome.i18n.getMessage(confirmText));
                } else {
                    hook.dialog.message = message
                    hook.dialog.cancelText = cancelText
                    hook.dialog.confirmText = confirmText
                }
                if (!hook.dialog.confirmText && !hook.dialog.cancelText) {
                    hook.dialog.cancelText = chrome.i18n.getMessage("__gotIt__")
                }
                hook.dialog.confirmAction = confirmAction
                if (hook.dialog.message) hook.dialog.show = true
            }
        },
        toast: {
            show: false,
            msg: '',
            closeTimer: undefined,
            showToast({ type, message, duration = 1000 }) {
                clearTimeout(hook.toast.closeTimer)
                hook.toast.show = false
                if (type === 'i18n') {
                    hook.toast.msg = chrome.i18n.getMessage(message)
                    if (!hook.toast.msg) return
                } else {
                    hook.toast.msg = message
                }
                hook.toast.show = true
                hook.toast.closeTimer = setTimeout(() => {
                    hook.toast.show = false
                }, duration)
            }
        },
        tips: {
            messages: [],
            message: computed(() => {
                if (hook.tips.messages.length < 1) {
                    return ''
                }
                return hook.tips.messages.reduce((total: string, message: string) => {
                    return total += chrome.i18n.getMessage(message)
                })
            })
        },
        eventToAnalytic(eventData) {
            eventData.params.locale = chrome.i18n.getMessage("@@ui_locale")
            hook.usePort({
                name: 'analytic',
                context: { req: eventData },
            })
        },
        async usePort({ name, context, onMsgHandle }) {
            const port = chrome.runtime.connect({ name: name })
            port.onMessage.addListener((context: IContext) => {
                onMsgHandle && onMsgHandle(context)
            })
            await port.postMessage(context)
        },
        setNoneStatus(changeID = false) {
            if (!hook.isHold) {
                hook.status = 'none'
                hook.dialog.show = false
                hook.toast.show = false
            }
            hook.findStatus = 'none';
            if (changeID) hook.transID++;
        },
        setHold() {
            hook.isHold = !hook.isHold
            hook.eventToAnalytic({
                name: 'setHold',
                params: {
                    value: hook.isHold
                }
            })
        },
        //@ts-ignore
        E: undefined,
        //@ts-ignore
        T: undefined
    })

    watch(() => hook.status, () => {
        if (hook.status === 'editing') {
            hook.getConf()
        }
    })

    hook.getConf()
    hook.E = editHook(hook)

    return hook
}

export function editHook(baseHook: IBaseHook): IEditHook {
    const hook: IEditHook = reactive({
        base: baseHook,
        editingText: '',
        lastFindText: '',
        clear() {
            hook.editingText = ''
            hook.base.findStatus = 'none'
            hook.base.transID++
        },
        getLastFindText() {
            hook.editingText = hook.lastFindText
        },
        pasteAndTrans() {
            const t = document.createElement("input");
            document.body.appendChild(t);
            t.focus();
            document.execCommand("paste");
            const clipboardText = t.value;
            hook.editingText = clipboardText
            document.body.removeChild(t);
            hook.trans('popup_paste')
        },
        trans(type = 'popup_icon') {
            if (hook.editingText.replace(/\s+|[\r\n]+/g, "").length === 0) {
                return
            }
            let from, to;
            if (hook.base.C.mode !== 'simple') {
                from = hook.base.C.fromLang
                to = hook.base.C.toLang
                if (from !== 'auto' && to === '__auto__') {
                    if (from !== hook.base.C.mainLang) {
                        to = hook.base.C.mainLang
                    } else {
                        to = hook.base.C.secondLang
                    }
                }
            }
            hook.base.bridge.editTrans = <ITransMsg>{ text: hook.editingText, type, from, to, findStatus: 'editLoading' }
            hook.base.isResultInit = true
            hook.base.findStatus = 'editLoading'
        },
        enterTrans(e: any) {
            if (e.code === 'Enter' && !e.shiftKey) {
                if (hook.base.C.keyDownTrans === 'Enter') {
                    hook.trans('popup_enter')
                }
            } else if (e.code === 'Enter' && e.shiftKey) {
                if (hook.base.C.keyDownTrans === 'Shift+Enter') {
                    hook.trans('popup_shift_enter')
                }
            }
        }
    })

    return hook
}

export function transHook(baseHook: IBaseHook): ITranslatorHook {
    const hook: ITranslatorHook = reactive({
        base: baseHook,
        lastFindText: '',
        show: false,
        find: new Find(''),
        fromIframe: undefined,
        toIframe: undefined,
        subIfram: undefined,
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
                        req: { text: hook.subTranslator.selectText, from: hook.find.result.resultFrom, to: hook.find.result.resultTo, type: 'sub', engine: hook.find.result.engine }
                    },
                    onMsgHandle: (context: IContext) => {
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
                if (hook.base.status === 'result') {
                    //@ts-ignore
                    hook.options.engine = hook.find.result.engine
                    hook.options.from = hook.find.result?.resultFrom
                    hook.options.to = hook.find.result?.resultTo
                } else {
                    hook.options.from = hook.base.C.fromLang
                    hook.options.to = hook.base.C.toLang
                }

            },
            async setLang() {
                await hook.options.close()
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
                hook.base.openOptionsPage('resultOption')
                hook.options.isShow = false
            },
            show() {
                if (!hook.find.result) return
                hook.options.getData()
                hook.options.isShow = true
                hook.eventToAnalytic({ name: "result_option_show", params: {} })
            },
            async exchange() {
                //@ts-ignore
                await hook.trans({ text: hook.find.result.text, type: 'exchange', from: hook.options.to, to: hook.options.from, findStatus: 'reLoading' })
                hook.options.isShow = false
            },
            async changeEngine() {
                // @ts-ignore
                hook.options.isShow = false
                await hook.trans({ text: hook.find.text, type: 'changeEngine', findStatus: 'reLoading' })

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
            if (context.req.id && context.req.id !== hook.base.transID) return
            if (!context.resp) return
            if (context.resp.tipsMessages) {
                hook.base.tips.messages = ['', ...context.resp.tipsMessages]
            } else {
                hook.base.tips.messages = []
            }

            if (context.resp.errMsg === '__needLogin__' || context.resp.errMsg === '__needRelogin__') {
                hook.base.dialog.showDialog({
                    type: 'i18n',
                    message: context.resp.errMsg,
                    confirmText: 'scanQR',
                    cancelText: '',
                    confirmAction: () => {
                        hook.usePort({
                            name: 'openOptionsPage',
                            context: { req: { tab: 'login' } },
                        })
                    }
                })
            }

            else if (context.resp.dialogMsg) {
                switch (context.resp.dialogMsg.message) {
                    case '__wantToApplyTrans__':
                        context.resp.dialogMsg.confirmAction = hook.applyBDDM
                        break
                    case '__transReqErr__':
                        if (hook.options.engine) {
                            hook.base.toast.showToast({
                                message: '__reqErr__',
                                type: 'i18n'
                            })

                            return
                        }
                        context.resp.dialogMsg.confirmText = '__change__'
                        context.resp.dialogMsg.confirmAction = () => {
                            let transEngine: ITransEngine = 'ggTrans__common'
                            if (hook.base.C.transEngine === 'ggTrans__common' || !hook.base.C.transEngine) {
                                transEngine = 'bdTrans__common'
                            } else {
                                transEngine = 'ggTrans__common'
                            }
                            chrome.storage.sync.set({ transEngine }, () => {
                                hook.base.dialog.show = false
                                hook.base.C.transEngine = transEngine
                                hook.base.toast.showToast({
                                    message: '__changeSuccess__',
                                    type: 'i18n'
                                })
                            })
                        }
                        break
                }
                hook.base.dialog.showDialog(context.resp.dialogMsg)
            }

            else if (context.resp.toastMsg) {
                hook.base.toast.showToast(context.resp.toastMsg)
            }
        },
        getMarkHtml() {
            return getMarkHtml(hook.marksList, hook.find.text)
        },
        async updateMark({ success, fail, info }) {
            await hook.usePort({
                name: 'updateMark',
                context: { req: info },
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
                context: { req: { tid: hook.find.tid } },
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
                hook.base.toast.showToast({ type: 'i18n', message: 'collTooLong' })
                fail?.call(hook)
                return
            }
            await hook.usePort({
                name: 'collect',
                context: {
                    req: {
                        text: hook.find.text,
                        translation: hook.find.result.text,
                        marks: hook.subTranslator.marksStr,
                        resultFrom: hook.find.result.resultFrom,
                        resultTo: hook.find.result.resultTo,
                        engine: hook.find.result.engine
                    }
                },
                onMsgHandle: (c) => {
                    if (!c.resp?.errMsg) {
                        hook.find.isCollected = true
                        hook.find.tid = c.resp?.data.tid
                        success && success(c.resp)
                    } else {
                        if (fail) fail({ msg: "needLogin" })
                    }
                }
            })
        },
        //翻译
        async trans(info) {
            const t = info.text
            if (t.replace(/\s+|[\r\n]+/g, "").length === 0) {
                return
            }

            // when change engine
            if (hook.base.status === 'result' && info.findStatus !== 'popLoading') {
                info.from || (info.from = hook.options.from);
                info.to || (info.to = hook.options.to);
            }

            if (hook.base.C.mode === 'profession' && info.type === 'select') {
                info.from = hook.base.C.fromLang
                info.to = hook.base.C.toLang
            }

            const find = new Find(info.text)
            hook.show = true;
            if (info.findStatus) {
                hook.base.findStatus = info.findStatus
            }

            await hook.usePort({
                name: 'translate',
                context: {
                    req: {
                        text: find.text, from: info.from, to: info.to, type: info.type,
                        mode: hook.base.mode, engine: hook.options.engine, id: ++hook.base.transID
                    }
                },
                onMsgHandle: (context: IContext) => {
                    if (!context.resp) return
                    if (context.req.id !== hook.base.transID) {
                        context.resp.errMsg = 'no equal id'
                    }
                    if (context.resp.errMsg) {
                        if (hook.base.findStatus === 'reLoading') {
                            hook.base.findStatus = 'willOK'
                            setTimeout(() => {
                                if (hook.base.findStatus === 'willOK') hook.base.findStatus = 'ok';
                            }, 400)
                        } else {
                            hook.base.findStatus = 'none'
                        }
                        return
                    }
                    if (!context.resp.data) {
                        hook.base.findStatus = 'ok'
                        return
                    }
                    hook.base.status = "result"
                    hook.find = find
                    hook.find.result = context.resp.data;
                    hook.marksList = [];
                    hook.options.isShow = false
                    hook.options.getData();
                    if (hook.base.findStatus === 'reLoading') {
                        hook.base.findStatus = 'willOK'
                        setTimeout(() => {
                            if (hook.base.findStatus === 'willOK') hook.base.findStatus = 'ok';
                        }, 400)
                    } else {
                        hook.base.findStatus = 'ok'
                    }

                    hook.subTranslator.init()
                    // setTimeout(() => {

                    // }, 1)

                }
            })
        },
        translateFromEdit() {
            hook.trans(hook.base.bridge.editTrans)
        },
        getTTS(audioType, id) {
            let text:string = '';
            let lang:string = '';
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

            //@ts-ignore
            const iframe = hook[`${audioType}Iframe`]
            const engine = new BaiduTrans()
            iframe.contentWindow.postMessage({
                source: "phrase",
                action: "playAudio",
                // src: `https://translate.googleapis.com/translate_tts?client=gtx&q=${text}&tl=${lang}&ttsspeed=1`,
                src: engine.getTTSSrc(lang, text),
                id: id
            }, '*')
            // hook.usePort({
            //     name: 'tts',
            //     context: {req:{ text: text, lang: lang, audioType: audioType}},
            //     onMsgHandle: (context: IContext) => {
            //         if (!context.resp || context.resp.errMsg) {
            //             console.log("getTTS err msg: ", context.resp?.errMsg)
            //             return
            //         }
            //         // @ts-ignore
            //         const iframe = hook[`${audioType}Iframe`]
            //         iframe.contentWindow.postMessage({
            //             source: "phrase",
            //             action: "playAudio",
            //             audioBase64: context.resp.data,
            //             id: id
            //         }, '*')
            //     }
            // })
        },
        toEdit() {
            hook.base.E.lastFindText = hook.base.E.editingText
            hook.base.E.editingText = ''
            hook.base.status = 'editing'
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
            hook.base.toast.showToast({ type: 'i18n', message: 'copyOK' })
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
                context: { req: eventData },
            })
        },
        async applyBDDM() {
            await hook.usePort({
                name: "applyBDDM",
                context: { req: {} }
            })
            hook.base.dialog.show = false
        },
        setResultPostion() { }
    })

    hook.options.getData()

    // if(hook.base.findStatus === 'editLoading') {
    //     hook.translateFromEdit()
    // }

    watchEffect(() => {
        if (hook.base.findStatus === 'editLoading') {
            hook.translateFromEdit()
        }
    })

    return hook
}

