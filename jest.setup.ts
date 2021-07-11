const fs = require('fs');
global.fetch = require('node-fetch');
import {apiWrap} from './src/utils/apiWithPort'

const rawdata = fs.readFileSync('src/_locales/zh_CN/messages.json');
const locale = JSON.parse(rawdata)

const storage = new Map()

const tokenInfo = {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MjY1MTQxNzcsInVpZCI6InRlc3RvcGVuaWQjI2V4dGVuc2lvblYxIn0.3QNX6w8o9-p62Nj_RuVROPo7yMWVYXY-92dCHYTBaNE',
    saveTime: new Date().getTime(),
    liveTime: 100000000000,
    openid: "testopenid"
}

storage.set("tokenInfo", tokenInfo)
const portPool = new Map()

const chrome = {
    i18n: {
        getMessage(message) {
            return locale[message].message
        },
    },
    storage: {
        sync:{
            get(list, callback) {
                const result = {}
                list.forEach(element => {
                    if(storage.has(element)) {
                        result[element] = storage.get(element)
                    }
                });
                callback(result)
                return result
            },
            remove(key, callBack) {
                storage.delete(key)
                callBack()
            },
            set(msg:Object) {
                for(let key in msg) {
                    storage.set(key, msg[key])
                }
            }
        }
    },
    runtime: {
        connect({name}) {
            const port = new Port(name)
            return port
        },
        onConnect:{
            addListener(msg) {

            }
        }
    },
    setTestToken() {
        storage.set("tokenInfo", tokenInfo)
    },
    sleep(mill:number) {
        return new Promise((resolve) => {
            setTimeout(() => resolve(true), mill)
        })
    }
 }

class Port {
    name: string
    callBack: Function
    postHandler: Function
    onMessage:any = {
        addListener: (callBack) => {
            this.callBack = callBack
        }
    }
    async postMessage(msg) {
        const backPort = new BackPort(this.callBack)
        const resp = await apiWrap[this.name](msg, backPort)
    }
    constructor(name:string) {
        this.name = name
    }
}

class BackPort {
    callBack: Function
    postMessage(res) {
        this.callBack(res)
    }
    constructor(callBack) {
        this.callBack = callBack
    }
}

Object.assign(global, {chrome})

Object.assign(global, {notest: () => {}})

