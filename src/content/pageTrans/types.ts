/** 段落状态 */
export type ParagraphStatus = 'pending' | 'translating' | 'done' | 'error' | 'skipped'

/** 段落模型 */
export interface Paragraph {
  id: string
  /** DOM 节点引用 */
  node: Element
  /** 原文 */
  originalText: string
  /** 译文（翻译后填充） */
  translatedText: string
  /** 语言 */
  lang: string
  /** 状态 */
  status: ParagraphStatus
  /** 错误信息 */
  error?: string
}

/** 页面翻译引擎状态 */
export type EngineStatus = 'idle' | 'extracting' | 'translating' | 'translated' | 'restoring' | 'error'

/** 译文显示模式 */
export type TransDisplayMode = 'bilingual' | 'targetOnly'

/** 译文样式 */
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

/** 页面翻译配置 */
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

/** 默认配置 */
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

/** 自定义属性名（命名空间前缀，避免与页面冲突） */
export const ATTR = {
  /** 标记该节点是译文注入节点 */
  translation: 'data-qyt-trans',
  /** 标记该节点是原文节点（已翻译） */
  original: 'data-qyt-original',
  /** 标记该段落已处理过 */
  processed: 'data-qyt-processed',
  /** 原文ID，用于一一对应 */
  paraId: 'data-qyt-para-id',
} as const

/** CSS 类名前缀 */
export const CLS = {
  wrapper: 'qyt-para-wrap',
  original: 'qyt-para-original',
  translation: 'qyt-para-translation',
  translating: 'qyt-para-translating',
  active: 'qyt-active',
} as const
