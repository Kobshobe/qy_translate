const fs = require('fs');
global.fetch = require('node-fetch');

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

Object.assign(global, {chrome: {
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
            },
            remove(key, callBack) {
                storage.delete(key)
                callBack()
            }
        }
    },
    setTestToken() {
        storage.set("tokenInfo", tokenInfo)
    }
}})