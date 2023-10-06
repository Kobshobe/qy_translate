interface IUsePortOptions {
    name:string
    message:any
    callback?:Function
}

export const usePort = async (options:IUsePortOptions) => {
    const port = chrome.runtime.connect({name: options.name})
    if (options.callback) {
        port.onMessage.addListener((res:any) => {
            options.callback && options.callback(res)
        })
    }
    await port.postMessage(options.message)
}
