import {Ref} from 'vue'
import { Context,IDialogMsg,IToastMsg } from '@/api/context'

export declare type ITransMode = 'popup'|'contentInject'|'pdf'

export declare type ITransStatus = 'editing'|'result'|'none'

export declare type ITransEngine = ''|'ggTrans__common'|'bdTrans__common'|'bdDM__finance'|
'bdDM__electronics'|'bdDM__mechanics'|'bdDM__medicine'|'bdDM__novel'

export declare type ITransType = 'sub'|'popup_icon'|'select'|'changeLang'|'popup_enter'|'popup_shift_enter'|'test'|
'exchange'|'popup_paste'|'menu'|'changeEngine'

export declare type IPortName = 'translate'|'collect'|'reduceCollect'|'updateMark'|'tts'|
'openOptionsPage'|'analytic'|'applyBDDM'

export declare type ITransFindStatus = 'none'|'ok'|'popLoading'|'reLoading'|'willOK'|'editLoading'

export interface IBaseHook {
    mode: ITransMode
    isResultInit: boolean
    status:ITransStatus
    findStatus: ITransFindStatus
    transID: number
    isHold: boolean
    lockLang: boolean
    bridge: any
    C: IAllStorage
    init(mode:ITransMode, status:ITransStatus) :void
    getConf() :void
    changeTreadWord() :void
    exchangeLang():void
    changeLang(isExchange:boolean):void
    eventToAnalytic(eventData:any) :void
    usePort({ name, context, onMsgHandle}:IPortHandler): void
    setNoneStatus(changeID?:boolean):void
    setHold() :void
    openOptionsPage(type:string):void
    dialog: {
        show: boolean
        message: string
        confirmText: string|undefined
        cancelText: string|undefined
        confirmAction: any
        showDialog(dialogMsg:IDialogMsg): void
    }
    toast: {
        show: boolean
        msg: string
        closeTimer: any
        showToast(toastMsg:IToastMsg): void
    },
    tips: {
        messages: string[]
        message: any
    }
    E: IEditHook
    T:ITranslatorHook
}

export interface IEditHook {
    base: IBaseHook
    editingText: string
    lastFindText: string
    clear() :void
    getLastFindText() :void
    pasteAndTrans() :void
    trans(type?:ITransType) :void
    enterTrans(e:any) :void
}

export interface ITranslatorHook {
    base: IBaseHook
    lastFindText: string
    show: boolean
    find: Find
    fromIframe: any
    toIframe: any
    subIfram: any
    marksList: any[]
    canReduceMark: boolean
    subTranslator: {
        status: 'loading'|'hide'|'result'|'showGate'
        selectText: string
        selectRange: number[]
        top: number
        left: number
        isLoading: boolean
        resultData: ITransResult | undefined
        marksStr: string,
        translate(): void
        afterMark(canReduce: boolean): void
        bookMark(): void
        mark(): void
        init(): void
    }
    options: {
        isShow: boolean
        from: string|undefined
        to: string|undefined
        engine: ITransEngine
        getData():void
        close():void
        show() :void
        exchange() :void
        changeEngine():void
        setLang():void
    }
    usePort({ name, context, onMsgHandle}:IPortHandler): void
    handleWebErr(msg: Context): void
    getMarkHtml(): string
    updateMark({ success, fail, info }: { success: Function, fail: Function, info: {marks: string, tid: number } }): void
    reduceCollect(): void
    collect({ success, fail }: { success?: Function, fail?: Function }): void
    trans(info: ITransMsg): void
    translateFromEdit(): void
    getTTS(audioType: string, id: string): void
    toEdit(): void
    copyResult(): void
    eventToAnalytic(eventData: any): void
    applyBDDM() :void
    setResultPostion():void
}

export interface IAllStorage {
    mainLang?: string
    secondLang?: string
    fromLang?: string
    toLang?:string
    isTreadWord?: boolean
    tokenInfo?: ITokenInfo
    mode?: 'simple'| 'profession'
    proMode?: 'float'|'edge'
    optionPageOpenParmas?: IOptionPageOpenParma
    menuTrans?: boolean
    transEngine?: ITransEngine
    showProun?: boolean
    keyDownTrans?: 'Enter'|'Shift+Enter'
}

export class Find {
    text: string
    result: ITransResult | undefined
    isCollected: boolean
    tid: number | null
    constructor(text:string) {
        this.text = text
        this.result = undefined
        this.isCollected = false
        this.tid = null
    }
}

export interface ITokenInfo {
    token: string
    saveTime: number
    liveTime: number
    openid: string
}

export interface ITokenInfoFromCloud {
    token: string
    openid: string
    liveTime: number
}

export interface ICollectResultMsg {
    statusMsg: string
    isCollected: boolean
    tid: number
}

export interface IWrapTransInfo {
    readonly text: string
    from?: string
    to?: string
    readonly type: string
    readonly mode: string
    engine?: string
    isDetectedLang?: boolean
    fromCode?: string
    toCode?: string
    fromCp?: string
    toCp?: string
    sFrom?: string
    sTo?: string
    cost?: number
    extraMsg?: Map<string, any>
}

export interface ITransResult {
    text: string
    resultFrom: string
    resultTo: string
    engine: string
    sPronunciation?: string
    tPronunciation?: string
    data?: any
    domain?: string
    examples?: ITransExample[]
    dict?: ITransDict[]
}

export interface ITransExample {
    text: string
    trans?: string
}

export interface ITransDict {
    pos: string
    trans: string
}

export interface IGTransResult {
    sentences: any[]
    dict?: IDictItem[]
    src: string
    alternative_translations: any[]
    confidence: number
    spell: any
    Id_result: any
    synsets: any[]
    examples?: any[]
}

export interface IDictItem {
    pos: string
    terms: string[]
    entry: string[]
    base_from: string
    pos_enum: number
}

export interface IMarkInfo {
    canReduce: boolean
    newMarksList: number[][]
}

export interface IOptionPageOpenParma {
    tab: 'login' | ''
    action?: string
}

export interface ILangInfo {
    main: string,
    secord: string
}

export interface IAnalyticEvent {
    name: string
    params: any
}

export interface eventItem {
    name: string
    type: "wrap" | "single"
    time: string
    duration: number
}

export interface ITransMsg {
    text: string,
    type: ITransType
    from?: string
    to?: string
    findStatus: ITransFindStatus
    engine?: string
    id?: number
}

export interface IPortHandler {
    name: IPortName
    context: Context
    onMsgHandle?(context:Context) :void
}

export interface IQrLoginParams {
    qrUrl: Ref<string>
    loginStatus: Ref<'loginOk' | 'none' | 'scanQr' | 'loadingQr' | 'invalidQr' | 'loadQrFail'>
}

export interface IClientInfo {
    c: string
    os: string
    l: string
    cv: string
    st: string
}

export interface IBDDMTransResult {
    result: string[]
    from: string
}
