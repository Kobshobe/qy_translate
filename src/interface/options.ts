// import {TTS} from './translator'

import { IAllStorage } from "./trans";
import { Context } from "@/api/context";

export interface IOptionBaseHook {
  OP: IConfHook
  coll: ICollHook
  user: {
    isLogin: boolean
    isShowLogin: boolean
    logout() :void
  }
}

export interface IConfHook {
  base: IOptionBaseHook
  conf: {
      C:IAllStorage,
      changeTransEngine() :void
      changeTreadWord() :void
      changeMode() :void
      changeMenuTrans() :void
      changeMainLang() :void
      changeSecondLang() :void
      changeShowProun() :void
      changeShowProun() :void
      changeKeyDownTrans() :void
  }
  getOpenParams():void
  init():void
}

export interface ICollHook {
  base: IOptionBaseHook
  tid: undefined | number
  name: string
  page: number,
  status: "none" | "edit"
  loadStatus: "none" | "loading" | "loaded" | "loadFail" | "loadingMore" | "noMore"|'empty'|'needLogin'
  showMarks: boolean
  showParaphrase: boolean
  collList: ICollection[]
  phraseList: IPhraseInfo[]
  pageSize: number
  tts: any
  playTTSInfo: IPlayTTSInfo
  selected: Set<number>
  setPlayMode(): void
  setAtSelected(tid: number) :void
  setStatus(s: string) :void
  moveToColl(e: any) :void
  deleteSelected(): void
  playList(): void
  stopPlayTTS(): void
  playTTS(index: number, isPlayList?: boolean) :void
  getCollList(): void
  getPhraseList(collId: number|undefined, page: number):void
  setShowMarks(): void
  setShowParaphrase(): void
  back() :void
  handleRespMsg(c:Context) :void
  init() :void
  initColl() :void
  collItem: {
    isShowDialog: boolean
    collName: string
    oldCollName: string
    collTid?: number
    deleted: number[]
    create() :void
    rename() :void
    delete(tid:number) :void
    showDialog(name?:string, tid?:number) :void
    createOrRename() :void
  }
}


export interface ITokenInfo {
  token: string
  saveTime: Date
}

export interface IPlayTTSInfo {
  nowPlayIndex: number
  isPlayList: boolean
  playMode: 'single' | 'cycle' | 'order'
  isChoice: boolean
  init(): void
}

export interface IPhraseInfo {
  text: string
  tid: number
  translation: string
  marks: string
  resultFrom: string
  resultTo: string
}

export interface ICollection {
  tid: number
  name: string
  UpdatedAt: number
}

export interface ICollPhraseInfo {
  text: string
  translation: string
  marks: string
  resultFrom: string
  resultTo: string
}

export interface ITransResult {
  text: string
  resultFrom: string
  resultTo: string
  pronunciation: string
  data: any
}

export interface IIndexHook {
  loadStatuse: string
  showAddCollInput: boolean,
  phraseList: any[],
  collList: any
  getCollectionList() :void
  addColl(name:string):void
  toFind() :void
  toCollectionManagerPage() :void
  toTips() :void
}

export interface IFindHook {
  mode: string
  text: string
  tid: undefined|number,
  result: undefined|ITransResult,
  tts: any,
  clear() :void
  find() :void
  copyResult() :void
  collect(): void
  playTTS(type:'from'|'to') :void
}