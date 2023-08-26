import {srvApiRequest} from '@/api/bqy'
import {Context} from './context'

export async function ping(c:Context) :Promise<Context> {
  console.log("------------ping------------")
  await srvApiRequest({
      c,
      path: "/v1/ping",
      method: "GET",
      auth: false,
      timeout: 2000,
  })
  console.log("ping res: ", c.resp)
  return c
}

export async function collectResult(c:Context) :Promise<Context> {
  await srvApiRequest({
    c,
    path: '/v1/phrase',
    method: 'POST',
    auth: true,
  })
  return c
}

export async function reduceCollect(c:Context) {
  await srvApiRequest({
    c,
    path: '/v1/phrase',
    method: 'DELETE',
    auth: true,
  })
  return c
}

export async function updateMark(c:Context) :Promise<Context> {
  await srvApiRequest({
    c,
    path: '/v1/phrase',
    method: 'PUT',
    auth: true,
  })
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

export async function applyBDDM(c:Context) :Promise<Context> {
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
  await srvApiRequest({
    c,
    path: '/v1/phrase/collection',
    method: 'GET',
    auth: true,
  })
  return c
}

export async function getCollList2(c:Context) :Promise<Context> {
  await srvApiRequest({
    c,
    path: '/v1/phrase/collection',
    method: 'GET',
    auth: true,
  })
  return c
}

export async function getPhraseList(c:Context) :Promise<Context> {
  await srvApiRequest({
    c,
    path: '/v1/phrase',
    method: 'GET',
    auth: true,
  })
  return c
}

export async function addCollection(c:Context) :Promise<Context> {
  await srvApiRequest({
    c,
    path: '/v1/phrase/collection',
    method: 'POST',
    auth: true,
  })
  return c
}

export async function renameCollection(c:Context) :Promise<Context> {
  await srvApiRequest({
    c,
    path: `/v1/phrase/collection`,
    method: 'PUT',
    auth: true,
  })
  return c
}

export async function deleteCollection(c:Context) :Promise<Context> {
  await srvApiRequest({
    c,
    path: `/v1/phrase/collection`,
    method: 'DELETE',
    auth: true,
  })
  return c
}

export async function moveToOtherColl(c:Context) :Promise<Context> {
  await srvApiRequest({
    c,
    path: '/v1/phrase/move',
    method: 'PUT',
    auth: true,
  })
  return c
}

export async function mulDelete(c:Context) :Promise<Context> {
  await srvApiRequest({
    c,
    path: `/v1/phrase/mul`,
    method: 'DELETE',
    auth: true,
  })
  return c
}