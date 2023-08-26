
export class SrvApiResp {
    code?:number
    msg?:string
    detail?:string
    data?:any
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

export class Context {
    req?: any
    resp: SrvApiResp = {}
    err?:string
    toastMsg?: IToastMsg
    dialogMsg?: IDialogMsg
    tipsMessages?: string[]
    res?:any

    constructor(req:any) {
        this.req = req
    }

    // respMsg() :string {
    //     return this.resp?.msg ? this.resp?.msg : ''
    // }

    // respMsgOrErr() :string {
    //     if (this.resp?.msg) {
    //         return this.resp.msg
    //     } else if (this.err) {
    //         return this.err
    //     } else {
    //         return ''
    //     }
    // }

    // isOk() :boolean {
    //     if (this.err || this.resp.msg) {
    //         return false
    //     }
    //     return true
    // }
}