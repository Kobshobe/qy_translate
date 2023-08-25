import { getTokenFromStorage, saveTokenInfo } from '@/utils/chromeApi'
import { Mode, client, reqTimeout } from '@/config'
import { IContext,IBaseReqParams,IBaseReqResult,IServerReqParams, IResponse, IQrLoginParams, ITokenInfo,IToastMsg, IDialogMsg, IConfig } from '@/interface/trans'
import { eventToGoogle } from '@/utils/analytics'

let protocol = 'https://'
let webSocketProtocol = 'wss://'
let BaseUrl = 'www.fishfit.fun/bqy/papi'

if (Mode === 'test' || Mode === 'jest') {
  protocol = 'http://'
  webSocketProtocol = 'ws://'
  BaseUrl = 'localhost:7600/bqy/papi'
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
  const ws = new WebSocket(webSocketProtocol + BaseUrl + '/v1/user/login_qr');
  ws.binaryType = 'arraybuffer';

  ws.onopen = (event) => {
    ws.send('login');
  };

  ws.onmessage = (event) => {
    const msg = getStrFromBuf(event.data);

    if (msg.slice(0, 9) === `{"token":`) {
      ws.send('loginOk');
      const tokenInfo:ITokenInfo = JSON.parse(msg)
      saveTokenInfo(tokenInfo, (msg: string) => {
        loginStatus.value = 'loginOk'
      })
      eventToGoogle({
        name: 'qr_loginOk',
        params: {
          openid: tokenInfo.openid,
          cost: start - new Date().getTime()
        }
      })
    } else if (msg.slice(0, 5) === '{err') {
    } else {
      qrUrl.value = 'data:image/jpeg;base64,' + window.btoa(msg);
      loginStatus.value = 'scanQr' // scanQr
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
    let s = '';
    for (let i = 0; i < len; i++) {
      s += String.fromCharCode(byte[i]);
    }
    return s;
  }
};


export async function baseFetch({ url, method, success, fail, data, headers = {}, successStatusCode = [200, 201], timeout=reqTimeout }:IBaseReqParams) :Promise<IBaseReqResult> {
  return new Promise<IBaseReqResult>((resolve, reject) => {

    headers["device"] = "device"
    headers["device_id"] = "deviceId"
    headers["Accept-Language"] = "zh-CN"

    const fetchData:RequestInit = {headers,method}
    if(method !== 'GET') {
      fetchData.body = data
    }
    fetch(url, fetchData)
      .then(async (res) => {
        const s = await res.text()
        let data;
        try {
          data = JSON.parse(s)
        } catch {
          data = s
        }
        
        if (successStatusCode.includes(res.status)) {
          resolve({
            status: res.status,
            data,
            response: res
          })
        } else {
          resolve({
            errMsg: 'statusErr',
            status: res.status,
            data,
            response: res
          })
        }
        success && success(res)
      })
      .catch(res => {
        resolve({
          errMsg: '__fetchErr__',
          status: 0,
          data: '',
          response: res
        })
        fail && fail(res)
      })
      setTimeout(() => {
        resolve({
          errMsg: '__timeout__',
          status: 0,
          data: null,
          //@ts-ignore
          response: null
        })
      }, timeout)
  })
}


export async function serveBaseReq(
  { url, method, success, fail, query, data = {}, headers = {}, auth = false, successStatusCode = [200, 201] }:
  IServerReqParams): Promise<IResponse> {


  if (method !== 'GET' && method !== 'get') {
    headers["Content-Type"] = "application/json"
  }

  const start = new Date().getTime()
  return new Promise<IResponse>(async (resolve, reject) => {
    if (auth === true) {
      headers.Authorization = "Bearer " + await getTokenFromStorage()
      if (headers.Authorization === '__needLogin__' || headers.Authorization === '__needRelogin__') {
        resolve({ errMsg: headers.Authorization, status: 401 })
        eventToGoogle({
          name: 'needLogin',
          params: {
            type: headers.Authorization,
            pos: 'before_req'
          }
        })
        return
      }
    }

    headers.c = client.c
    headers.cv = client.cv
    if (method.toLowerCase() === 'get' ) {
      headers["Content-Type"] = 'application/json'
    }

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
            pos: 'after_req'
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

function getResult(res: IBaseReqResult):IResponse {
    let toastMsg:IToastMsg|undefined = res.data && res.data.toastMsg;
    const dialogMsg: IDialogMsg|undefined = res.data && res.data.dialogMsg;
    
    if(res.status === 401) {
      res.errMsg = '__needLogin__'
    }
    else if(res.errMsg === '__fetchErr__') {
      toastMsg = {
        type: 'i18n',
        message: '__fetchErr__'
      }
    }
    else if (res.data.msg) {
      console.log('get res.data.msg')
      !res.data?.detail && (res.data.detail = res.data.msg)
      res.errMsg = res.data.msg
      toastMsg = {
        type: 'normal',
        message: res.data.detail
      }
    }
    else {
      if(!toastMsg && res.errMsg) {
        toastMsg = {
          type: 'i18n',
          message: '__reqErr__'
        }
      }
    }

    const c:IResponse = {
      status: res.status,
      errMsg: res.errMsg,
      data: res.data,
      toastMsg,
      dialogMsg
    }

    if (res?.data) {
      c.resData = res.data.data
      c.resCode = res.data.code
      c.resMsg = res.data.msg
      c.resDetail = res.data.detail
    }


    return c
}

export async function collectResult(c:IContext) {
  c.resp =  await serveBaseReq({
    url: '/v1/phrase',
    method: 'POST',
    data: c.req,
    auth: true,
    successStatusCode: [201, 200]
  })
  return c
}

export async function reduceCollect(c:IContext): Promise<any> {
  c.resp = await serveBaseReq({
    url: '/v1/phrase',
    method: 'DELETE',
    data:c.req,
    auth: true,
    successStatusCode: [200]
  })
  return c
}

export async function updateMark(c:IContext) {
  c.resp = await serveBaseReq({
    url: '/v1/phrase',
    method: 'PUT',
    data:c.req,
    auth: true,
    successStatusCode: [200]
  })
  return c
}

export async function domainTransApi(query:any) {
  const resp =  await serveBaseReq({
    url: '/v1/trans/DMTrans',
    method: 'GET',
    query,
    auth: true,
    successStatusCode: [200]
  })


  if (resp.errMsg === '__needLogin__' || resp.errMsg === '__needRelogin__') {
    return resp
  }

  if(resp.status === 200) {
    return resp
  }

  if (resp.data && resp.data.msg === '__noRice__') {
    resp.errMsg = '__noRice__'
    resp.dialogMsg = {
      message: '__wantToApplyTrans__',
      confirmText: '__applyServiceFree__',
      type: 'i18n'
    }
  } else if (resp.data.msg === '__totalFreeOver__') {
    resp.dialogMsg = {
      message: '__totalFreeOver__',
      type: 'i18n'
    }
  } else if (!resp.toastMsg) {
    resp.toastMsg = {
      message: '__reqErr__',
      type: 'i18n'
    }
  }
  return resp
}

export async function applyBDDM(c:IContext) :Promise<IContext> {

  c.resp = await serveBaseReq({
    url: '/v1/trans/applyDM',
    method: 'POST',
    auth: true,
  })

  if (c.resp?.resMsg === 'JwtTokenErr') {
    c.resp.errMsg = '__needLogin__'
    return c
  }

  if (c.resp.status === 200) {
    c.resp.dialogMsg = {
      message: '__applyOK__',
      type: 'i18n'
    }
    return c
  }
  
  if(c.resp.resMsg && c.resp.resMsg === '__noRice__') {
    c.resp.dialogMsg = {
      message: '__noRice__',
      type: 'i18n'
    }

  } else if(c.resp.resMsg && c.resp.resMsg === '__noMouthAccess__') {
    c.resp.dialogMsg = {
      message: '__noMouthAccess__',
      type: 'i18n'
    }

  } else {
    c.resp.dialogMsg = {
      message: '__applyFail__',
      type: 'i18n'
    }
  }

  return c
}

export async function getCollList(c:IContext) :Promise<IContext> {
  c.resp = await serveBaseReq({
    url: '/v1/phrase/collection',
    method: 'GET',
    auth: true,
  })
  return c
}

export async function getPhraseList(c:IContext) :Promise<IContext> {
  c.resp = await serveBaseReq({
    url: '/v1/phrase',
    query: c.req,
    method: 'GET',
    auth: true,
  })
  return c
}

export async function addCollection(c:IContext) :Promise<IContext> {
  c.resp = await serveBaseReq({
    url: '/v1/phrase/collection',
    data: c.req,
    method: 'POST',
    auth: true,
  })
  return c
}

export async function renameCollection(c:IContext) :Promise<IContext> {
  c.resp = await serveBaseReq({
    url: `/v1/phrase/collection?tid=${c.req.tid}`,
    data: {
      name: c.req.name
    },
    method: 'PUT',
    auth: true,
  })
  return c
}

export async function deleteCollection(c:IContext) :Promise<IContext> {
  c.resp = await serveBaseReq({
    url: `/v1/phrase/collection?tid=${c.req.tid}`,
    method: 'DELETE',
    auth: true,
  })
  return c
}

export async function moveToOtherColl(c:IContext) :Promise<IContext> {
  c.resp = await serveBaseReq({
    url: '/v1/phrase/move',
    data: c.req,
    method: 'PUT',
    auth: true,
  })
  return c
}

export async function mulDelete(c:IContext) :Promise<IContext> {
  c.resp = await serveBaseReq({
    url: `/v1/phrase/mul`,
    data: c.req,
    method: 'DELETE',
    auth: true,
  })
  return c
}