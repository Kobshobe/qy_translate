import { markRaw, reactive } from "vue";
import { getPhraseList, moveToOtherColl, mulDelete, getCollList, addCollection, renameCollection, deleteCollection } from "@/api/api";
import { TTS } from '@/translator/tts';
import { ICollHook, ICollection, IOptionBaseHook } from "@/interface/options"
import { ElMessageBox } from "element-plus";
import { ElMessage } from "element-plus";
import {geti18nMsg} from '@/utils/share'
import { getTokenFromStorage } from "@/utils/chromeApi";
import { Context } from "@/api/context";

export function collHook(base:IOptionBaseHook) :ICollHook {

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
    pageSize: 100,
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
    handleRespMsg(c:Context) {
      if (c.err === '__needLogin__' || c.err === '__needRelogin__' || c.err == 'JwtTokenErr') {
        hook.loadStatus = 'needLogin'
      } 
    
      else if (c.dialogMsg) {
        if(c.dialogMsg.type === 'i18n') {
          //@ts-ignore
          ElMessage(chrome.i18n.getMessage(c.resp.toastMsg.message))
        }
      }
    
      else if (c.toastMsg) {
        if(c.toastMsg.type === 'i18n') {
          ElMessage(geti18nMsg(c.toastMsg.message))
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
      } else if (hook.playTTSInfo.playMode === 'single') {
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
    },
    async moveToColl(tid:number) {
      if (hook.selected.size < 0) return;

      const c = new Context({
        phraseTidList: Array.from(hook.selected),
        collId: tid,
      })
      await moveToOtherColl(c);
      //_mark
      if (!c.err) {
        hook.moveOutList()
      } else {
        hook.handleRespMsg(c)
      }
    },
    async deleteSelected() {
      if (hook.selected.size <= 0) return;
      ElMessageBox.alert(geti18nMsg('__confirmToDelete__'), {
        confirmButtonText: geti18nMsg('__confirm__'),
        callback: async (e:string) => {
          if(e !== 'confirm') return;

          const c = new Context({phraseTidList: Array.from(hook.selected)})
          await mulDelete(c)
          if(!c.err) {
            hook.moveOutList()
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
          if(!hook.playTTSInfo.isChoice) {
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
    nextPage() {
      // const page = hook.page + 1
      // hook.getList(page)

    },
    stopPlayTTS() {
      hook.playTTSInfo.init()
    },
    playTTS: async (index) => {
      if (hook.status === 'edit') return
      // hook.tts.player.stop()
      if(hook.playTTSInfo.isPlayList) {
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
    moveOutList() {
      try {
        const newList: any[] = []
        hook.phraseList.forEach((item) => {
          if (!hook.selected.has(item.tid)) {
            newList.push(item)
          }
        })
        hook.phraseList = []
        setTimeout(() => {
          hook.phraseList = newList
        })
      }
      finally {
        hook.selected.clear()
      }

    },
    async getCollList() {
      const c = new Context({})
      await getCollList(c)
      if (!c.err) {
        const data = c.resp.data as ICollection[];
        hook.collList = [{name: geti18nMsg('__default__'), tid:0, UpdatedAt: 50000000000000}, ...data]
        hook.collList.sort((a, b) => {
          return b.UpdatedAt - a.UpdatedAt
        })
      } else {
        hook.handleRespMsg(c)
      }
    },
    async getPhraseList(collId:number, page: number) {
      if(collId === hook.tid && (hook.loadStatus === 'loadingMore' || hook.loadStatus === 'loading' || hook.loadStatus === 'noMore')) return
      if(collId !== hook.tid) {
        hook.tid = collId
        page == 1 && (hook.page = 0);
      }
      hook.playTTSInfo.init()
      if(page > 1) {
        hook.loadStatus = "loadingMore";
      } else {
        hook.loadStatus = "loading";
      }
      if(page === 1) {
        hook.phraseList = []
      }
      const c = new Context({collId, limit: hook.pageSize, offset: (page-1)*hook.pageSize})
      await getPhraseList(c);
      if (!c.err) {

        setTimeout(() => {
          if (page === 1) {
            //@ts-ignore
            hook.phraseList = c.resp.data
          } else {
            //@ts-ignore
            hook.phraseList.push(...c.resp.data)
          }
          if(hook.phraseList.length < 1) {
            hook.loadStatus = 'empty'
            //@ts-ignore
          } else if (c.resp.data.length < hook.pageSize) {
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
    },
    setShowParaphrase() {
      hook.showParaphrase = !hook.showParaphrase
    },
    back() {
      hook.stopPlayTTS()
    },
    initColl() {
      if(hook.base.user.isLogin) {
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
        const c = new Context({name: hook.collItem.collName})
        await addCollection(c)
        if(!c.err) {
          hook.collList.push({name: hook.collItem.collName, tid:c.resp.data.tid, UpdatedAt: 500000000})
          hook.collItem.isShowDialog = false
        } else {

        }
      },
      async rename() {
        if(!hook.collItem.collName) return
        if(hook.collItem.collName === hook.collItem.oldCollName) {
          hook.collItem.isShowDialog = false
          return
        }
        const c = new Context({
          tid: hook.collItem.collTid,
          name: hook.collItem.collName
        })
        await renameCollection(c)

        if(!c.err) {
          hook.collList.some((coll) => {
            if(coll.tid === hook.collItem.collTid) {
              coll.name = hook.collItem.collName
              return
            }
          })
        }  else {
          hook.handleRespMsg(c)
        }
        hook.collItem.isShowDialog = false
      },
      async delete(tid) {
        ElMessageBox.alert(geti18nMsg('__confirmToDelete__'), {
          confirmButtonText: geti18nMsg('__confirm__'),
          callback: async (e:string) => {
            if (e !== 'confirm') return;

            const c = new Context({tid})
            await deleteCollection(c)
    
            if(!c.err) {
              if(tid === hook.tid) {
                hook.phraseList = []
              }
              hook.collItem.deleted.push(tid)            
            } else {
              hook.handleRespMsg(c)
            }
          },
        })
      },
      showDialog(name='', tid=undefined) {
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