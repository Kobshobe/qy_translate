import {IRequestResult} from '@/utils/interface'

export class BaseTrans {
    maxLenght: number = 2000
  
    checkTextLen(text:string) :IRequestResult|null {
      console.log(text.length)
      if(text.length > this.maxLenght) {
        return {
          errMsg: 'textTooLong',
          toastMsg: {
              type: 'i18n',
              message: '__textTooLong__'
        }
      }
      }
      return null
    }
  }