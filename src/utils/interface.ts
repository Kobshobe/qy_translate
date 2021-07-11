import {Ref} from 'vue'

declare type ITransEngine = ''|'ggTrans__common'|'bdTrans__common'|'bdDM__finance'|
'bdDM__electronics'|'bdDM__mechanics'|'bdDM__medicine'|'bdDM__novel'

declare type ITransType = 'sub'|'edit_icon'|'select'|'changeLang'|'edit_enter'|'test'|
'exchange'|'edit_paste'|'menu'|'changeEngine'

declare type IPortName = 'translate'|'collect'|'reduceCollect'|'updateMark'|'tts'|
'openOptionsPage'|'analytic'|'applyBDDM'

declare type ITransStatus = 'none'|'ok'|'loading'|'reLoading'|'willOK'

export interface IContext {
    req: any
    resp?: IResponse
}

export interface ITranslatorHook {
    mode: 'resultOnly'|'popup'|'pdf'
    status: 'result' | 'editing'
    editingText: string
    lastFindText: string
    show: boolean
    find: Find
    findStatus: ITransStatus
    fromIframe: any
    toIframe: any
    subIfram: any
    dialogMsg: {
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
    }
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
        openOptionsPage():void
        show() :void
        exchange() :void
        changeEngine():void
        setLang():void
    }
    conf: IConfig
    usePort({ name, context, onMsgHandle}:IPortHandler): void
    handleWebErr(msg: IContext): void
    getMarkHtml(): string
    updateMark({ success, fail, info }: { success: Function, fail: Function, info: {marks: string, tid: number } }): void
    reduceCollect(): void
    collect({ success, fail }: { success?: Function, fail?: Function }): void
    trans(info: ITranslateMsg): void
    translateFromEdit(e: any): void
    getTTS(audioType: string, id: string): void
    clear(): void
    toEdit(): void
    copyResult(): void
    eventToAnalytic(eventData: any): void
    getLastFindText() :void
    applyBDDM() :void
    pasteAndTrans() :void
    tips: {
        message: string
    }
}

export interface IAllStorage {
    mainLang?: string
    secondLang?: string
    fromLang?: string
    toLang?:string
    isTreadWord?: boolean
    tokenInfo?: ITokenInfo
    mode?: 'simple'| 'profession'
    optionPageOpenParmas?: IOptionPageOpenParma
    menuTrans?: boolean
    transEngine?: ITransEngine
}

export interface IConfig {
    C: IAllStorage
    getConf() :void
    changeTreadWord() :void
}

export interface IToastMsg {
    type: 'normal'|'i18n'|'lang'
    message: string
    duration?: number
}

export interface IDialogMsg {
    type: 'normal'|'i18n'|'lang'
    message: string
    confirmText?: string
    cancelText?: string
    confirmAction?: any
}

export interface IBaseReqParams {
    url: string
    method: string
    success?: Function
    fail?: Function
    data?: any
    headers?: any
    successStatusCode?: number[]
}

export interface IBaseReqResult {
    errMsg?: string,
    status: number|undefined
    data: any
    response: Response
}

export interface IServerReqParams {
    url: string
    method: string
    query?: any
    success?: Function
    fail?: Function
    data?: any
    headers?: any
    auth: boolean
    successStatusCode?: number[]
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
    cost?: number
    extraMsg?: Map<string, any>
}


export interface IResponse {
    errMsg?: string
    data?: any
    status?: number
    toastMsg?: IToastMsg
    dialogMsg?: IDialogMsg
    tipsMessage?: string
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

export interface ITranslateMsg {
    text: string,
    type: ITransType
    from?: string
    to?: string
    findStatus?: ITransStatus
    engine?: string
}

export interface IPortHandler {
    name: IPortName
    context: IContext
    onMsgHandle?(context:IContext) :void
}

export interface IQrLoginParams {
    qrUrl: Ref<string>
    loginStatus: Ref<'loginOk' | 'none' | 'scanQr' | 'loadingQr' | 'invalidQr' | 'loadQrFail'>
}

export interface IConfigInfo {
    isTreadWord?: boolean
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

export interface IOptionHook {
    tabsInfo: string[]
    activeTabIndex: number
    conf: {
        C:IAllStorage,
        changeTransEngine() :void
        changeTreadWord() :void
        changeMode() :void
        changeMenuTrans() :void
        changeMainLang() :void
        changeSecondLang() :void
    }
    getOpenParams():void
    selectTab(index:number):void
    init():void
}
