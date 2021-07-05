import {Ref} from 'vue'

export interface IToastMsg {
    type: 'normal'|'i18n'|'lang'
    message: string
    duration?: number
}

export interface IDialogMsg {
    type: 'normal'|'i18n'|'lang'
    message: string
    confirmText: string
    cancelText: string
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
    data: string
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
    text: string
    from: string
    to: string
    type: string
    mode: string
    engine: string
}


export interface IRequestResult {
    errMsg?: string
    data?: any
    status?: number
    toastMsg?: IToastMsg
    serveToastMsg?: IToastMsg
}

export interface ITransResult {
    text: string
    resultFrom: string
    resultTo: string
    engine: string
    translit?: string
    srcTranslit?: string
    data?: any
    domain?: string
}

export interface ITransResultFromApi {
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
    type: 'sub' | 'edit_icon' | 'select' | 'changeLang' | 'edit_enter' | 'test'|'exchange'
    from?: string
    to?: string
    findStatus?: 'loading'|undefined
    engine?: string
}

export interface ITranslatorHook {
    mode: 'resultOnly'|'popup'|'pdf'
    status: 'result' | 'editing'
    editingText: string
    lastFindText: string
    show: boolean
    find: Find
    findStatus: 'none' | 'ok' | 'loading' | 'reLoading' | 'willOK'
    fromIframe: any
    toIframe: any
    subIfram: any
    dialogMsg: {
        show: boolean
        message: string
        confirmText: string
        cancelText: string
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
        status: 'loading' | 'hide' | 'result' | 'showGate'
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
        engine: string
        close():void
        openOptionsPage():void
        show() :void
        exchange() :void
        changeEngine():void
    }
    configInfo: {
        isTreadWord: boolean
        engine: string
        info: IConfigInfo|{}
        getTreadWord() :void
        changeTreadWord() :void
    }
    usePort({ name, msg, onMsgHandle }: { name: string, msg: any, onMsgHandle: Function }): void
    handleWebErr(msg: IRequestResult): void
    getMarkHtml(): string
    updateMark({ success, fail, info }: { success: Function, fail: Function, info: {marks: string, tid: number } }): void
    reduceCollect(): void
    collect({ success, fail }: { success?: Function, fail?: Function }): void
    translateText({ text, from, to, type, findStatus, engine }: ITranslateMsg): void
    translateFromEdit(e: any): void
    getTTS(audioType: string, id: string): void
    clear(): void
    toEdit(): void
    copyResult(): void
    eventToAnalytic(eventData: any): void
    toAnalytics(event: IAnalyticEvent) :void
    getLastFindText() :void
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