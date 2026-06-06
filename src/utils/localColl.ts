import { IPhraseInfo, ICollection } from '@/interface/options'

const COUNTER_KEY = 'localColl_counter'
const COLLECTIONS_KEY = 'localColl_collections'
const PHRASES_PREFIX = 'localColl_phrases_'

async function getNextId(): Promise<number> {
  const data = await chrome.storage.local.get(COUNTER_KEY)
  const nextId = (data[COUNTER_KEY] || 1000) + 1
  await chrome.storage.local.set({ [COUNTER_KEY]: nextId })
  return nextId
}

export async function initDefaultCollection(): Promise<void> {
  const data = await chrome.storage.local.get(COLLECTIONS_KEY)
  if (!data[COLLECTIONS_KEY] || (data[COLLECTIONS_KEY] as ICollection[]).length === 0) {
    const defaultColl: ICollection = { tid: 0, name: '默认', UpdatedAt: Date.now() }
    await chrome.storage.local.set({ [COLLECTIONS_KEY]: [defaultColl] })
  }
}

export async function getCollections(): Promise<ICollection[]> {
  const data = await chrome.storage.local.get(COLLECTIONS_KEY)
  return data[COLLECTIONS_KEY] || []
}

export async function addCollection(name: string): Promise<ICollection> {
  const coll: ICollection = { tid: await getNextId(), name, UpdatedAt: Date.now() }
  const collections = await getCollections()
  collections.push(coll)
  await chrome.storage.local.set({ [COLLECTIONS_KEY]: collections })
  return coll
}

export async function renameCollection(tid: number, name: string): Promise<boolean> {
  const collections = await getCollections()
  const idx = collections.findIndex(c => c.tid === tid)
  if (idx === -1) return false
  collections[idx].name = name
  collections[idx].UpdatedAt = Date.now()
  await chrome.storage.local.set({ [COLLECTIONS_KEY]: collections })
  return true
}

export async function deleteCollection(tid: number): Promise<boolean> {
  if (tid === 0) return false // cannot delete default
  const collections = await getCollections()
  const idx = collections.findIndex(c => c.tid === tid)
  if (idx === -1) return false
  collections.splice(idx, 1)
  await chrome.storage.local.set({ [COLLECTIONS_KEY]: collections })
  // also remove all phrases in this collection
  await chrome.storage.local.remove(PHRASES_PREFIX + tid)
  return true
}

function phrasesKey(collTid: number): string {
  return PHRASES_PREFIX + collTid
}

export async function getPhrases(collTid: number): Promise<IPhraseInfo[]> {
  const data = await chrome.storage.local.get(phrasesKey(collTid))
  return data[phrasesKey(collTid)] || []
}

export async function addPhrase(phrase: Omit<IPhraseInfo, 'tid'>, collTid: number = 0): Promise<IPhraseInfo> {
  const newPhrase: IPhraseInfo = {
    ...phrase,
    tid: await getNextId(),
  }
  const phrases = await getPhrases(collTid)
  // check duplicate by text
  const existing = phrases.find(p => p.text === newPhrase.text)
  if (existing) {
    return existing // return existing without adding duplicate
  }
  phrases.unshift(newPhrase) // newest first
  await chrome.storage.local.set({ [phrasesKey(collTid)]: phrases })
  return newPhrase
}

export async function removePhrase(tid: number): Promise<boolean> {
  const data = await chrome.storage.local.get(null)
  for (const key of Object.keys(data)) {
    if (key.startsWith(PHRASES_PREFIX)) {
      const phrases = data[key] as IPhraseInfo[]
      const idx = phrases.findIndex(p => p.tid === tid)
      if (idx !== -1) {
        phrases.splice(idx, 1)
        await chrome.storage.local.set({ [key]: phrases })
        return true
      }
    }
  }
  return false
}

export async function updatePhraseMarks(tid: number, marks: string): Promise<boolean> {
  const data = await chrome.storage.local.get(null)
  for (const key of Object.keys(data)) {
    if (key.startsWith(PHRASES_PREFIX)) {
      const phrases = data[key] as IPhraseInfo[]
      const idx = phrases.findIndex(p => p.tid === tid)
      if (idx !== -1) {
        phrases[idx].marks = marks
        await chrome.storage.local.set({ [key]: phrases })
        return true
      }
    }
  }
  return false
}

export async function movePhrasesToColl(tids: number[], toCollTid: number): Promise<boolean> {
  const phrasesToMove: IPhraseInfo[] = []
  const data = await chrome.storage.local.get(null)
  for (const key of Object.keys(data)) {
    if (key.startsWith(PHRASES_PREFIX)) {
      const phrases = data[key] as IPhraseInfo[]
      const remaining = phrases.filter(p => {
        if (tids.includes(p.tid)) {
          phrasesToMove.push(p)
          return false
        }
        return true
      })
      if (remaining.length !== phrases.length) {
        await chrome.storage.local.set({ [key]: remaining })
      }
    }
  }
  if (phrasesToMove.length > 0) {
    const targetPhrases = await getPhrases(toCollTid)
    targetPhrases.unshift(...phrasesToMove)
    await chrome.storage.local.set({ [phrasesKey(toCollTid)]: targetPhrases })
  }
  return phrasesToMove.length > 0
}

export async function removePhrases(tids: number[]): Promise<boolean> {
  let removed = false
  const data = await chrome.storage.local.get(null)
  for (const key of Object.keys(data)) {
    if (key.startsWith(PHRASES_PREFIX)) {
      const phrases = data[key] as IPhraseInfo[]
      const remaining = phrases.filter(p => !tids.includes(p.tid))
      if (remaining.length !== phrases.length) {
        await chrome.storage.local.set({ [key]: remaining })
        removed = true
      }
    }
  }
  return removed
}

export async function getPhraseByText(text: string): Promise<{ phrase: IPhraseInfo; collTid: number } | null> {
  const data = await chrome.storage.local.get(null)
  for (const key of Object.keys(data)) {
    if (key.startsWith(PHRASES_PREFIX)) {
      const phrases = data[key] as IPhraseInfo[]
      const found = phrases.find(p => p.text === text)
      if (found) {
        const collTid = parseInt(key.replace(PHRASES_PREFIX, ''), 10)
        return { phrase: found, collTid }
      }
    }
  }
  return null
}
