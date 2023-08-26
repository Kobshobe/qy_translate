import { saveTokenInfo } from '@/utils/chromeApi'
import {IQrLoginParams, ITokenInfo } from '@/interface/trans'
import { eventToGoogle } from '@/utils/analytics'
import {baseWs} from '@/config'

export async function qrLogin({ qrUrl, loginStatus }: IQrLoginParams) {
    eventToGoogle({
      name: 'load_qr',
      params: {
        status: loginStatus.value,
      }
    })
  
    loginStatus.value = 'loadingQr'
    const start = new Date().getTime()
    const ws = new WebSocket(baseWs + '/v1/user/login_qr');
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