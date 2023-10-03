

interface IUsePortOptions {
    name:string
    message:any
    beforeCallback?:Function
    callback?:Function
}

export const usePort = async (options:IUsePortOptions) => {
    const port = chrome.runtime.connect({name: options.name})
    port.onMessage.addListener((res:any) => {
        options.beforeCallback && options.beforeCallback(res);
        options.callback && options.callback(res);
    })
    await port.postMessage(options.message)
}