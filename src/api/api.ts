import { getTokenFromStorage, saveTokenInfo } from '../utils/chromeApi'
import { Ref } from 'vue'
import { Mode, client } from '../config'
import { IBaseReqParams,IBaseReqResult,IServerReqParams, IRequestResult, IQrLoginParams, ITokenInfo,IToastMsg } from '@/utils/interface'
import { eventToGoogle } from '../utils/analytics'

let protocol = "https://"
let webSocketProtocol = "wss://"
let BaseUrl = 'www.fishfit.fun:8080/p'

if (Mode === 'test' || Mode === 'jest') {
  protocol = 'http://'
  webSocketProtocol = 'ws://'
  BaseUrl = 'localhost:8080/p'
}

export async function qrLogin({ qrUrl, loginStatus }: IQrLoginParams) {
  eventToGoogle({
    name: 'load_qr',
    params: {
      status: loginStatus.value,
    }
  })

  loginStatus.value = 'loadingQr'
  const start = new Date().getTime()
  const ws = new WebSocket(webSocketProtocol + BaseUrl + "/user/login_qr");
  ws.binaryType = "arraybuffer";

  ws.onopen = (event) => {
    ws.send("login");
  };

  ws.onmessage = (event) => {
    const msg = getStrFromBuf(event.data);
    if (msg.slice(0, 9) === `{"token":`) {
      ws.send("loginOk");
      const tokenInfo:ITokenInfo = JSON.parse(msg)
      saveTokenInfo(tokenInfo, (msg: string) => {
        loginStatus.value = "loginOk"
      })
      eventToGoogle({
        name: 'qr_loginOk',
        params: {
          openid: tokenInfo.openid,
          cost: start - new Date().getTime()
        }
      })
    } else if (msg.slice(0, 5) === "{err") {
    } else {
      qrUrl.value = "data:image/jpeg;base64," + window.btoa(msg);
      loginStatus.value = "scanQr" // scanQr
      eventToGoogle({
        name: 'qr_load',
        params: {
          cost: start - new Date().getTime()
        }
      })
    }
  };

  ws.onclose = function (event) {
    if (loginStatus.value === 'scanQr') {
      loginStatus.value = 'invalidQr'
    } else if (loginStatus.value === 'loadingQr') {
      loginStatus.value = 'loadQrFail'
    }
    eventToGoogle({
      name: 'qr_ws_close',
      params: {
        status: loginStatus.value,
      }
    })
  };

  function getStrFromBuf(buf: ArrayBuffer) {
    const byte = new Uint8Array(buf);
    const len = byte.byteLength;
    let s = "";
    for (let i = 0; i < len; i++) {
      s += String.fromCharCode(byte[i]);
    }
    return s;
  }
};


export async function baseFetch({ url, method, success, fail, data, headers = {}, successStatusCode = [200, 201] }:IBaseReqParams) :Promise<IBaseReqResult> {
  return new Promise<IBaseReqResult>((resolve, reject) => {
    const fetchData:any = {headers,method}
    if(method !== 'GET') {
      fetchData.body = data
    }
    fetch(url, fetchData)
      .then(async (res) => {
        if (successStatusCode.includes(res.status)) {
          resolve({
            status: res.status,
            data: await res.text(),
            response: res
          })
        } else {
          resolve({
            errMsg: 'statusErr',
            status: res.status,
            data: await res.text(),
            response: res
          })
        }
        success && success(res)
      })
      .catch(res => {
        console.log('fetch err: ', res)
        resolve({
          errMsg: '__fetchErr__',
          status: 0,
          data: '',
          response: res
        })
        fail && fail(res)
      })
  })
}


export async function serveBaseReq(
  { url, method, success, fail, query, data = {}, headers = {}, auth = false, successStatusCode = [200, 201] }:
  IServerReqParams): Promise<IRequestResult> {

  const start = new Date().getTime()
  return new Promise<IRequestResult>(async (resolve, reject) => {
    if (auth === true) {
      headers.Authorization = await getTokenFromStorage()
      if (headers.Authorization === '__needLogin__' || headers.Authorization === '__needRelogin__') {
        resolve({ errMsg: headers.Authorization, status: 401 })
        eventToGoogle({
          name: 'needLogin',
          params: {
            type: headers.Authorization,
            pos: "before_req"
          }
        })
        return
      }
    }

    headers.c = client.c
    headers.cv = client.cv

    if (query) {
      url = url + makeQuery(query)
    }
    const result = await baseFetch({
      url: protocol + BaseUrl + url,
      method,
      data: JSON.stringify(data),
      headers
    })
    const cost = new Date().getTime() - start

    const deal = getResult(result)
    console.log(deal)

    if(!result.errMsg) {
      eventToGoogle({
        name: 'serveReqOk',
        params: {
          url,
          method,
          cost
        }
      })
      resolve(deal)
      success && success(deal);
    }

    else {
      if(deal.status === 401) {
        eventToGoogle({
          name: 'needLogin',
          params: {
            type: deal.errMsg,
            pos: "after_req"
          }
        })
      } else {
        eventToGoogle({
          name: 'serveReqFail',
          params: {
            url,
            method,
            cost,
            errMsg: result.errMsg
          }
        })
      }
      resolve(deal)
      fail && fail(deal);
    }
  })
  
}

function makeQuery(queryObject:any) {
  const query = Object.entries(queryObject).reduce((params:any, entry:any) => {
        params.push(entry.join('='))
        return params
      }, []).join('&')
  return encodeURI(`?${query}`)
}

function getResult(res: IBaseReqResult):IRequestResult {

    let data;
    let toastMsg:IToastMsg|undefined;
    let serveToastMsg:IToastMsg|undefined;;

    if (!res.errMsg) {
      try {
        data = JSON.parse(res.data)
        serveToastMsg = data.serveToastMsg
      } catch {
        data = res.data
      }
    } else {
      console.log('get err: ', res)
      if(res.status === 401) {
        console.log('get err 401')
        res.errMsg = '__needLogin__'
      }
      else if(res.errMsg === '__fetchErr__') {
        toastMsg = {
          type: 'i18n',
          message: '__fetchErr__'
        }
      }
      else {
        toastMsg = {
          type: 'i18n',
          message: '__reqErr__'
        }
      }
    }

    return {
      status: res.status,
      errMsg: res.errMsg,
      data,
      toastMsg,
      serveToastMsg
    }
  
}

export async function collectResult({ success, fail, data }: { success?: Function, fail?: Function, data: any }) {
  return await serveBaseReq({
    url: '/phrase',
    method: 'POST',
    data,
    success: (res: any) => {
      success && success(res)
    },
    fail: (err: any) => fail && fail(err),
    auth: true,
    successStatusCode: [201]
  })
}

export async function reduceCollect({ success, fail, data }: { success?: Function, fail?: Function, data: any }): Promise<any> {
  return await serveBaseReq({
    url: '/phrase',
    method: 'DELETE',
    data,
    success: (res: any) => success && success(res),
    fail: (err: any) => fail && fail(err),
    auth: true,
    successStatusCode: [200]
  })
}

export async function updateMark({ success, fail, data }: { success?: Function, fail?: Function, data: any }) {
  return await serveBaseReq({
    url: '/phrase',
    method: 'PUT',
    data,
    success: (res: any) => success && success(res),
    fail: (err: any) => fail && fail(err),
    auth: true,
    successStatusCode: [200]
  })
}

export async function sendEvent(data: any) {
  return await serveBaseReq({
    url: '/phrase',
    method: 'POST',
    data,
    success: () => { },
    fail: () => { },
    auth: false
  })
}

export async function baiduDomainTransApi(query:any) {
  return await serveBaseReq({
    url: '/trans/baidu',
    method: 'GET',
    query,
    success: () => {},
    fail: () => {},
    auth: false,
  })
}