import { onMounted, reactive, markRaw } from 'vue';
import { getOptionOpenParmas, getTransConf, removeTokenInfo, getTokenFromStorage } from '@/utils/chromeApi';
import { eventToGoogle } from '@/utils/analytics';
import { IConfHook, IOptionBaseHook, ICollHook, ICollection } from '@/interface/options'
import { IAllStorage } from '@/interface/trans'
import { getPhraseList, moveToOtherColl, mulDelete, getCollList, addCollection, renameCollection, deleteCollection } from "@/api/api";
import { TTS } from '@/translator/tts';
import { geti18nMsg } from '@/utils/share'
import { Context } from '@/api/context';
import {XMessage, XMessageBox} from '@/xxui/index'

const treadWordOff = chrome.i18n.getMessage("treadWordOff")

export function optionBaseHook(): IOptionBaseHook {
  const hook: IOptionBaseHook = reactive({
    user: {
      isLogin: true,
      isShowLogin: false,
      logout() {
        removeTokenInfo(() => {
          hook.coll.phraseList = []
          hook.coll.collList = []
          hook.user.isLogin = false
        });
        eventToGoogle({
          name: "logout",
          params: {
            scene: 'user_icon'
          },
        });
      }
    },
    //@ts-ignore
    coll: undefined,
    //@ts-ignore
    OP: undefined,
  })

  hook.coll = collHook(hook)
  hook.OP = confHook(hook)

  return hook
}


export default function confHook(base: IOptionBaseHook): IConfHook {
  const hook: IConfHook = reactive({
    base,
    conf: {
      C: <IAllStorage>{},
      changeTransEngine() {
        chrome.storage.sync.set({ transEngine: hook.conf.C.transEngine })
        eventToGoogle({
          name: 'changeTransEngine',
          params: {
            value: hook.conf.C.transEngine,
            scene: 'option'
          }
        })
      },
      changeMainLang() {
        chrome.storage.sync.set({ mainLang: hook.conf.C.mainLang })
        eventToGoogle({
          name: 'changeMainLang',
          params: {
            value: hook.conf.C.mainLang,
            scene: 'option'
          }
        })
      },
      changeSecondLang() {
        chrome.storage.sync.set({ secondLang: hook.conf.C.secondLang })
        eventToGoogle({
          name: 'changeSecondLang',
          params: {
            value: hook.conf.C.secondLang,
            scene: 'option'
          }
        })
      },
      changeTreadWord() {
        chrome.storage.sync.set({ isTreadWord: hook.conf.C.isTreadWord })
        if (!hook.conf.C.isTreadWord) {
          XMessage.message({
            message: treadWordOff,
            type: "info",
          });
        }
        eventToGoogle({
          name: 'changeTreadWord',
          params: {
            value: hook.conf.C.isTreadWord,
            scene: 'option'
          }
        })
      },
      changeMode() {
        chrome.storage.sync.set({ mode: hook.conf.C.mode })
        eventToGoogle({
          name: 'changeMode',
          params: {
            value: hook.conf.C.mode,
            scene: 'option'
          }
        })
      },
      changeMenuTrans() {
        chrome.storage.sync.set({ menuTrans: hook.conf.C.menuTrans })
        if (hook.conf.C.menuTrans) {
          chrome.contextMenus.create({
            id: "trans",
            title: "翻译",
            contexts: ['selection']
          })
        } else {
          chrome.contextMenus.remove('trans')
        }
        eventToGoogle({
          name: 'changeMenuTrans',
          params: {
            value: hook.conf.C.menuTrans,
            scene: 'option'
          }
        })
      },
      changeShowProun() {
        chrome.storage.sync.set({ showProun: hook.conf.C.showProun })
        eventToGoogle({
          name: 'changeShowProun',
          params: {
            value: hook.conf.C.showProun,
            scene: 'option'
          }
        })
      },
      changeKeyDownTrans() {
        chrome.storage.sync.set({ keyDownTrans: hook.conf.C.keyDownTrans })
        eventToGoogle({
          name: 'changeKeyDownTrans',
          params: {
            value: hook.conf.C.keyDownTrans,
            scene: 'option'
          }
        })
      }
    },
    async getOpenParams() {
      const params = await getOptionOpenParmas();
      if (params.optionPageOpenParmas?.tab === "login") {
        hook.base.user.isShowLogin = true
      }
      const conf = await getTransConf()
      hook.conf.C = conf
      chrome.storage.sync.remove('optionPageOpenParmas')
    },
    async init() {
      hook.getOpenParams()
    }
  })

  onMounted(() => {
    hook.init()

    chrome.storage.onChanged.addListener((e) => {
      if (e?.optionPageOpenParmas?.newValue?.tab === 'login' || e?.optionPageOpenParmas?.newValue?.tab === 'login') {
        if (!hook.base.user.isShowLogin) {
          hook.getOpenParams()
        }
      }
    })
  })

  return hook
}

export function collHook(base: IOptionBaseHook): ICollHook {
  const hook = reactive<ICollHook>({
    base,
    tid: undefined,
    name: "",
    page: 0,
    status: "none",
    loadStatus: "none",
    showMarks: true,
    showParaphrase: false,
    phraseList: [],
    collList: [],
    pageSize: 10,
    tts: markRaw(new TTS()),
    playTTSInfo: {
      nowPlayIndex: -1,
      isPlayList: false,
      playMode: 'cycle',
      isChoice: false,
      init() {
        hook.tts.player.pause()
        hook.playTTSInfo.nowPlayIndex = -1
        hook.playTTSInfo.isPlayList = false
      }
    },
    selected: new Set(),
    handleRespMsg(c: Context) {
      if (!c.resp) return
      if (c.err === '__needLogin__' || c.err === '__needRelogin__' || c.err === 'JwtTokenErr') {
        hook.loadStatus = 'needLogin'
      }

      else if (c.dialogMsg) {
        if (c.dialogMsg.type === 'i18n') {
          //@ts-ignore
          XMessage(chrome.i18n.getMessage(c.resp.toastMsg.message))
        }
      }

      else if (c.toastMsg) {
        if (c.toastMsg.type === 'i18n') {
          XMessage(geti18nMsg(c.toastMsg.message))
        }
      }
    },
    setPlayMode() {
      const modeList: ['cycle', 'order', 'single'] = ['cycle', 'order', 'single']
      let index = modeList.indexOf(hook.playTTSInfo.playMode)
      if (index >= modeList.length - 1) {
        index = -1
      }
      hook.playTTSInfo.playMode = modeList[index + 1]
      if (hook.playTTSInfo.playMode === 'order') {
      } else if (hook.playTTSInfo.playMode === 'cycle') {
        // 循环播放
      } else if (hook.playTTSInfo.playMode === 'single') {
        // '单个循环播放'
      }
    },
    setAtSelected(tid: number) {
      hook.selected.add(tid);
    },
    setStatus(s: "none" | "edit") {
      if (s === "edit") {
        hook.stopPlayTTS()
      }
      hook.status = s;
      hook.selected.clear();
      eventToGoogle({
        name: 'collSetStatus',
        params: {
          value: s
        }
      })
    },
    async moveToColl(tid: number) {
      if (hook.selected.size < 0) return;
      const c = new Context({
        phraseTidList: Array.from(hook.selected),
        collId: tid,
      })
      await moveToOtherColl(c);
      if (!c.err) {
        eventToGoogle({
          name: 'moveToColl',
          params: {
            amount: hook.selected.size,
          }
        })
        location.reload();
      } else {
        hook.handleRespMsg(c)
      }
    },
    async deleteSelected() {
      if (hook.selected.size <= 0) return;
      XMessageBox.alert(geti18nMsg('__confirmToDelete__'), {
        confirmButtonText: geti18nMsg('__confirm__'),
        callback: async (e: string) => {
          if (e !== 'confirm') return;

          const c = new Context({ phraseTidList: Array.from(hook.selected) })
          await mulDelete(c)
          if (!c.err) {
            eventToGoogle({
              name: 'deleteColl',
              params: {
                amount: hook.selected.size
              }
            })
            location.reload();
          } else {
            hook.handleRespMsg(c)
          }
        },
      })
    },
    playList: async () => {
      if (hook.playTTSInfo.isPlayList) {
        hook.playTTSInfo.nowPlayIndex = -1
        hook.playTTSInfo.isPlayList = false
        hook.tts.player.pause()
        return
      } else {
        if (hook.status === "edit") {
          hook.setStatus('none')
        }
      }

      hook.playTTSInfo.nowPlayIndex = 0
      const maxIndex = hook.phraseList.length - 1;
      hook.playTTSInfo.isPlayList = true
      let delay = 1000;
      while (hook.playTTSInfo.nowPlayIndex <= maxIndex) {
        if (!hook.playTTSInfo.isPlayList) break

        await hook.tts.play(
          hook.phraseList[hook.playTTSInfo.nowPlayIndex].text,
          hook.phraseList[hook.playTTSInfo.nowPlayIndex].resultFrom,
          delay
        );

        if (hook.playTTSInfo.playMode === 'order' || hook.playTTSInfo.playMode === 'cycle') {
          if (!hook.playTTSInfo.isChoice) {
            hook.playTTSInfo.nowPlayIndex += 1
            delay = 1000
          } else {
            hook.playTTSInfo.isChoice = false
            delay = 0
          }
          if (hook.playTTSInfo.playMode === 'cycle' && hook.playTTSInfo.nowPlayIndex > maxIndex) {
            if (hook.playTTSInfo.nowPlayIndex >= maxIndex) {
              hook.playTTSInfo.nowPlayIndex = 0
            }
          }
        }
      }
      hook.playTTSInfo.nowPlayIndex = -1
      hook.playTTSInfo.isPlayList = false

    },
    stopPlayTTS() {
      hook.playTTSInfo.init()
    },
    playTTS: async (index) => {
      if (hook.status === 'edit') return
      // hook.tts.player.stop()
      if (hook.playTTSInfo.isPlayList) {
        hook.playTTSInfo.nowPlayIndex = index
        hook.playTTSInfo.isChoice = true
      } else {
        hook.playTTSInfo.nowPlayIndex = index
        await hook.tts.play(hook.phraseList[hook.playTTSInfo.nowPlayIndex].text, hook.phraseList[hook.playTTSInfo.nowPlayIndex].resultFrom)
        if (hook.playTTSInfo.nowPlayIndex === index) {
          hook.playTTSInfo.nowPlayIndex = -1
        }
      }
    },
    async getCollList() {
      const c = await getCollList(new Context({}))
      if (c.res) {
        const data = c.res.collList as ICollection[];
        hook.collList = [{ name: geti18nMsg('__default__'), tid: 0, UpdatedAt: 50000000000000 }, ...data]
        hook.collList.sort((a, b) => {
          return b.UpdatedAt - a.UpdatedAt
        })
      } else {
        hook.handleRespMsg(c)
      }
    },
    async getPhraseList(collId: number, page: number) {
      if (collId === hook.tid && (hook.loadStatus === 'loadingMore' || hook.loadStatus === 'loading' || hook.loadStatus === 'noMore')) return
      if (collId !== hook.tid) {
        hook.tid = collId
        page == 1 && (hook.page = 0);
      }
      hook.playTTSInfo.init()
      if (page > 1) {
        hook.loadStatus = "loadingMore";
      } else {
        hook.loadStatus = "loading";
      }
      if (page === 1) {
        hook.phraseList = []
      }

      const c = await getPhraseList(new Context({collId, limit: hook.pageSize, offset: (page - 1) * hook.pageSize }));

      if (c.res) {
        setTimeout(() => {
          const list = c.res.list as any;
          if (page === 1) {
            hook.phraseList = list
          } else {
            hook.phraseList.push(...list)
          }
          if (hook.phraseList.length < 1) {
            hook.loadStatus = 'empty'
          } else if (list.length < hook.pageSize) {
            hook.loadStatus = 'noMore'
          } else {
            hook.loadStatus = 'loaded'
          }
        })
        hook.page = page
      } else {
        hook.handleRespMsg(c)
        hook.loadStatus = 'loadFail'
      }
    },
    setShowMarks() {
      hook.showMarks = !hook.showMarks
      eventToGoogle({
        name: 'setShowMarks',
        params: {
          value: hook.showMarks
        }
      })
    },
    setShowParaphrase() {
      hook.showParaphrase = !hook.showParaphrase
      eventToGoogle({
        name: 'setShowParaphrase',
        params: {
          value: hook.showParaphrase
        }
      })
    },
    back() {
      hook.stopPlayTTS()
    },
    initColl() {
      if (hook.base.user.isLogin) {
        hook.getCollList()
        hook.getPhraseList(0, 1)
      }
    },
    async init() {
      const token = await getTokenFromStorage();
      if (token !== "__needLogin__" && token !== "__needRelogin__") {
        hook.base.user.isLogin = true
      } else {
        hook.base.user.isLogin = false
        hook.loadStatus = 'needLogin'
      }
    },
    collItem: {
      isShowDialog: false,
      collName: '',
      oldCollName: '',
      collTid: undefined,
      deleted: [],
      createOrRename() {
        if (!hook.collItem.collName) return
        if (hook.collItem.collTid) {
          hook.collItem.rename()
        } else {
          hook.collItem.create()
        }
      },
      async create() {
        const c = new Context( { name: hook.collItem.collName })
        await addCollection(c)
        if (!c.err) {
          hook.collList.push({ name: hook.collItem.collName, tid: c.resp.data.tid, UpdatedAt: 500000000 })
          hook.collItem.isShowDialog = false
        } else {

        }
      },
      async rename() {
        if (!hook.collItem.collName) return
        if (hook.collItem.collName === hook.collItem.oldCollName) {
          hook.collItem.isShowDialog = false
          return
        }
        const c = new Context({
          tid: hook.collItem.collTid,
          name: hook.collItem.collName
        })
        await renameCollection(c)

        if (!c.err) {
          hook.collList.some((coll) => {
            if (coll.tid === hook.collItem.collTid) {
              coll.name = hook.collItem.collName
              return
            }
          })
        } else {
          hook.handleRespMsg(c)
        }
        hook.collItem.isShowDialog = false
      },
      async delete(tid) {
        XMessageBox.alert(geti18nMsg('__confirmToDelete__'), {
          confirmButtonText: geti18nMsg('__confirm__'),
          callback: async (e: string) => {
            if (e !== 'confirm') return;

            const c = new Context({ tid })
            await deleteCollection(c)

            if (!c.err) {
              if (tid === hook.tid) {
                hook.phraseList = []
              }
              hook.collItem.deleted.push(tid)
            } else {
              hook.handleRespMsg(c)
            }
          },
        })
      },
      showDialog(name = '', tid = undefined) {
        hook.collItem.collName = name
        hook.collItem.oldCollName = name
        hook.collItem.collTid = tid
        hook.collItem.isShowDialog = true
      }
    }
  })

  hook.init()

  return hook
}