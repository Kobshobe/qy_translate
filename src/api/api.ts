import {srvApiRequest} from '@/api/bqy'
import {Context} from './context'
import {
  initDefaultCollection,
  addPhrase,
  removePhrase,
  updatePhraseMarks,
  getCollections as localGetCollections,
  getPhrases as localGetPhrases,
  addCollection as localAddCollection,
  renameCollection as localRenameCollection,
  deleteCollection as localDeleteCollection,
  movePhrasesToColl,
  removePhrases,
} from '@/utils/localColl'

export async function ping(c:Context) :Promise<Context> {
  console.log("------------ping------------")
  await srvApiRequest({
      c,
      path: "/v1/ping",
      method: "GET",
      auth: false,
      timeout: 2000,
  })
  console.log("ping res: ", c)
  return c
}

export async function collectResult(c:Context) :Promise<Context> {
  await initDefaultCollection()
  const { text, translation, marks, resultFrom, resultTo } = c.req || {}
  if (!text) {
    c.err = '__invalidParams__'
    return c
  }
  try {
    const phrase = await addPhrase({ text, translation, marks, resultFrom, resultTo }, 0)
    c.res = { tid: phrase.tid }
  } catch (e: any) {
    c.err = e.message || '__localSaveError__'
  }
  return c
}

export async function reduceCollect(c:Context) {
  const { tid } = c.req || {}
  if (!tid) {
    c.err = '__invalidParams__'
    return c
  }
  try {
    await removePhrase(tid)
  } catch (e: any) {
    c.err = e.message || '__localSaveError__'
  }
  return c
}

export async function updateMark(c:Context) :Promise<Context> {
  const { tid, marks } = c.req || {}
  if (!tid) {
    c.err = '__invalidParams__'
    return c
  }
  try {
    await updatePhraseMarks(tid, marks || '[]')
  } catch (e: any) {
    c.err = e.message || '__localSaveError__'
  }
  return c
}

export async function domainTransApi(c:Context) :Promise<Context> {
  await srvApiRequest({
    c,
    path: '/v1/trans/DMTrans',
    method: 'GET',
    auth: true,
  })

  if (!c.err) {
    c.dialogMsg = {
      message: '__applyOK__',
      type: 'i18n'
    }
    return c
  }

  if (c.err === '__needLogin__' || c.err === '__needRelogin__') {
    return c
  }

  if (c.err === '__noRice__') {
    c.dialogMsg = {
      message: '__wantToApplyTrans__',
      confirmText: '__applyServiceFree__',
      type: 'i18n'
    }
  } else if (c.err === '__totalFreeOver__') {
    c.dialogMsg = {
      message: '__totalFreeOver__',
      type: 'i18n'
    }
  } else if (!c.toastMsg) {
    c.toastMsg = {
      message: '__reqErr__',
      type: 'i18n'
    }
  }
  return c
}

export async function applyDomainTrans(c:Context) :Promise<Context> {
  await srvApiRequest({
    c,
    path: '/v1/trans/applyDM',
    method: 'POST',
    auth: true,
  })

  if (!c.err) {
    c.dialogMsg = {
      message: '__applyOK__',
      type: 'i18n'
    }
    return c
  }

  if (c.err === 'JwtTokenErr') {
    return c
  }
  
  if(c.err === '__noRice__') {
    c.dialogMsg = {
      message: '__noRice__',
      type: 'i18n'
    }
  } else if(c.err === '__noMouthAccess__') {
    c.dialogMsg = {
      message: '__noMouthAccess__',
      type: 'i18n'
    }
  } else {
    c.dialogMsg = {
      message: '__applyFail__',
      type: 'i18n'
    }
  }

  return c
}

export async function getCollList(c:Context) :Promise<Context> {
  try {
    const collList = await localGetCollections()
    c.res = { collList }
  } catch (e: any) {
    c.err = e.message || '__localLoadError__'
  }
  return c
}

export async function getPhraseList(c:Context) :Promise<Context> {
  try {
    const { collId, limit, offset } = c.req || {}
    let phrases = await localGetPhrases(collId ?? 0)
    // sort newest first by tid descending
    phrases.sort((a, b) => b.tid - a.tid)
    const start = offset || 0
    const end = start + (limit || 100)
    const list = phrases.slice(start, end)
    c.res = { list }
  } catch (e: any) {
    c.err = e.message || '__localLoadError__'
  }
  return c
}

export async function addCollection(c:Context) :Promise<Context> {
  const { name } = c.req || {}
  if (!name) {
    c.err = '__invalidParams__'
    return c
  }
  try {
    const coll = await localAddCollection(name)
    c.resp = { data: { tid: coll.tid } } as any
  } catch (e: any) {
    c.err = e.message || '__localSaveError__'
  }
  return c
}

export async function renameCollection(c:Context) :Promise<Context> {
  const { tid, name } = c.req || {}
  if (!tid || !name) {
    c.err = '__invalidParams__'
    return c
  }
  try {
    await localRenameCollection(tid, name)
  } catch (e: any) {
    c.err = e.message || '__localSaveError__'
  }
  return c
}

export async function deleteCollection(c:Context) :Promise<Context> {
  const { tid } = c.req || {}
  if (tid === undefined || tid === null) {
    c.err = '__invalidParams__'
    return c
  }
  try {
    await localDeleteCollection(tid)
  } catch (e: any) {
    c.err = e.message || '__localSaveError__'
  }
  return c
}

export async function moveToOtherColl(c:Context) :Promise<Context> {
  const { phraseTidList, collId } = c.req || {}
  if (!phraseTidList || collId === undefined || collId === null) {
    c.err = '__invalidParams__'
    return c
  }
  try {
    await movePhrasesToColl(phraseTidList, collId)
  } catch (e: any) {
    c.err = e.message || '__localSaveError__'
  }
  return c
}

export async function mulDelete(c:Context) :Promise<Context> {
  const { phraseTidList } = c.req || {}
  if (!phraseTidList) {
    c.err = '__invalidParams__'
    return c
  }
  try {
    await removePhrases(phraseTidList)
  } catch (e: any) {
    c.err = e.message || '__localSaveError__'
  }
  return c
}
