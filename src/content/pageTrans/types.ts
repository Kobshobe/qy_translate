/** Paragraph status */
export type ParagraphStatus = 'pending' | 'translating' | 'done' | 'error' | 'skipped'

/** Paragraph model */
export interface Paragraph {
  id: string
  /** DOM node reference */
  node: Element
  /** Original text */
  originalText: string
  /** Translated text (filled after translation) */
  translatedText: string
  /** Language */
  lang: string
  /** Status */
  status: ParagraphStatus
  /** Error message */
  error?: string
}

/** Page translation engine status */
export type EngineStatus = 'idle' | 'extracting' | 'translating' | 'translated' | 'restoring' | 'error'

/** Translation display mode */
export type TransDisplayMode = 'bilingual' | 'targetOnly'

/** Translation style */
export type TransStyle =
  | 'none'
  | 'underline'
  | 'dashed'
  | 'highlight'
  | 'marker'
  | 'blur'
  | 'dotted'
  | 'border'
  | 'bgColor'

/** Page translation config */
export interface PageTransConfig {
  enable: boolean
  displayMode: TransDisplayMode
  transStyle: TransStyle
  showFloatingBall: boolean
  autoTransSites: string[]
  blockSites: string[]
  batchSize: number
  concurrency: number
}

/** Default config */
export const defaultPageTransConfig: PageTransConfig = {
  enable: true,
  displayMode: 'bilingual',
  transStyle: 'none',
  showFloatingBall: true,
  autoTransSites: [],
  blockSites: [],
  batchSize: 10,
  concurrency: 3,
}

/** Custom attribute names (namespaced prefix to avoid page conflicts) */
export const ATTR = {
  /** Marks a node as an injected translation node */
  translation: 'data-qyt-trans',
  /** Marks a node as an original (translated) node */
  original: 'data-qyt-original',
  /** Marks a paragraph as already processed */
  processed: 'data-qyt-processed',
  /** Original ID, used for one-to-one correspondence */
  paraId: 'data-qyt-para-id',
} as const

/** CSS class name prefix */
export const CLS = {
  wrapper: 'qyt-para-wrap',
  original: 'qyt-para-original',
  translation: 'qyt-para-translation',
  translationInline: 'qyt-para-translation-inline',
  translationSibling: 'qyt-para-translation-sibling',
  translating: 'qyt-para-translating',
  active: 'qyt-active',
} as const
