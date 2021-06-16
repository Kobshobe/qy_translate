import {Ref} from 'vue'

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

export interface ITransInfo {
    text: string
    from: string
    to: string
    type: string
    mode: string
}


export interface IRequestResult {
    errMsg: string
    data?: any
    status?: number
    toastMsg?: string
    serveToastMsg?: string
}

export interface ITransResult {
    text: string
    resultFrom: string
    resultTo: string
    pronunciation: string
    data: any
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

export interface IEventList {
    name: string
    client: string
    clientVersion: string
    eventList: any[]
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
}

export interface ITranslatorHook {
    mode: 'resultOnly'|'popup'|'pdf'
    status: 'result' | 'editing'
    editingText: string,
    show: boolean,
    find: Find,
    findStatus: 'none' | 'ok' | 'loading' | 'reLoad',
    fromIframe: any,
    toIframe: any,
    subIfram: any,
    dialogMsg: {
        show: boolean
        contentText: string
        confirmText: string
        cancelText: string
        confirmAction: any
        showDialog(contentText: string, confirmText: string, cancelText: string, confirmAction: any): void
    }
    toast: {
        show: boolean
        msg: string
        closeTimer: any
        showToast({ msg, duration }: { msg: string, duration?: number }): void
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
        close():void
        openOptionsPage():void
        show() :void
        exchange() :void
    }
    configInfo: {
        isTreadWord: boolean
        info: IConfigInfo|{}
        getTreadWord() :void
        changeTreadWord() :void
    }
    usePort({ name, msg, onMsgHandle }: { name: string, msg: any, onMsgHandle: Function }): void
    handleWebErr(msg: IRequestResult): void
    getMarkHtml(): void
    updateMark({ success, fail, info }: { success: Function, fail: Function, info: {marks: string, tid: number } }): void
    reduceCollect(): void
    collect({ success, fail }: { success?: Function, fail?: Function }): void
    translateText({ text, from, to, type, findStatus }: ITranslateMsg): void
    translateFromEdit(e: any): void
    getTTS(audioType: string, id: string): void
    clear(): void
    toEdit(): void
    copyResult(): void
    eventToAnalytic(eventData: any): void
    toAnalytics(event: IAnalyticEvent) :void
}

export interface IQrLoginParams {
    qrUrl: Ref<string>
    loginStatus: Ref<'loginOk' | 'none' | 'scanQr' | 'loadingQr' | 'invalidQr' | 'loadQrFail'>
}

export interface IConfigInfo {
    isTreadWord?: boolean
}