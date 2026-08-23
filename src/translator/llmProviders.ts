export interface ILLMProviderDef {
  /** Provider id, used in LLM engine codes: llm__<id>_<uuid> */
  id: string
  /** Display name shown in the options page (preset grid / form) */
  displayName: string
  /** Preset API base URL used when the preset is picked */
  baseUrl: string
  /** Recommended models shown as quick-fill suggestions */
  models: string[]
  /** URL keywords used to infer the provider from an apiUrl (legacy configs); first match wins */
  urlKeywords: string[]
  /** Avatar/card gradient used by the options page */
  gradient: string
}

/**
 * Single source of truth for LLM providers: engine id, display name, preset
 * baseUrl + models, apiUrl inference keywords, and the options-page gradient.
 * The SvgIcon type is derived as `llm_${id}` (see the llm_* branches in
 * SvgIcon.vue), so nothing provider-specific is maintained elsewhere.
 */
export const llmProviders: ILLMProviderDef[] = [
  { id: 'deepseek', displayName: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', models: ['deepseek-v4-flash', 'deepseek-v4-pro', 'deepseek-chat', 'deepseek-reasoner'], urlKeywords: ['api.deepseek.com'], gradient: 'linear-gradient(135deg, #4D6BFE, #7B8EFF)' },
  { id: 'kimi', displayName: 'Kimi', baseUrl: 'https://api.moonshot.cn/v1', models: ['kimi-k3', 'kimi-k2.6', 'kimi-k2.5'], urlKeywords: ['moonshot'], gradient: 'linear-gradient(135deg, #1C1C1C, #4A4A4A)' },
  { id: 'claude', displayName: 'Claude', baseUrl: 'https://api.anthropic.com/v1', models: ['claude-3-5-sonnet', 'claude-3-opus', 'claude-3-haiku', 'claude-3-sonnet'], urlKeywords: ['anthropic'], gradient: 'linear-gradient(135deg, #D97757, #E8957D)' },
  { id: 'openai', displayName: 'OpenAI', baseUrl: 'https://api.openai.com/v1', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'], urlKeywords: ['api.openai.com'], gradient: 'linear-gradient(135deg, #10A37F, #1EC99A)' },
  { id: 'minimax', displayName: 'MiniMax', baseUrl: 'https://api.minimax.chat/v1', models: ['MiniMax-M3', 'MiniMax-M2.7', 'MiniMax-M2.7-highspeed', 'MiniMax-M2.5', 'MiniMax-M2.5-highspeed', 'MiniMax-M2.1', 'MiniMax-M2.1-highspeed', 'MiniMax-M2'], urlKeywords: ['minimax', 'minimaxi'], gradient: 'linear-gradient(135deg, #D4367A, #ED6D48)' },
  { id: 'glm', displayName: 'GLM', baseUrl: 'https://open.bigmodel.cn/api/paas/v4', models: ['glm-5', 'glm-5-turbo', 'glm-4.7', 'glm-4.7-flashx', 'glm-4.7-flash', 'glm-4.6', 'glm-4.5', 'glm-4.5-air', 'glm-4-flash'], urlKeywords: ['bigmodel'], gradient: 'linear-gradient(135deg, #5B6AF0, #7B8AF5)' },
  { id: 'qwen', displayName: 'Qwen', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', models: ['qwen-plus', 'qwen-turbo', 'qwen-max'], urlKeywords: ['dashscope'], gradient: 'linear-gradient(135deg, #615CED, #817CF0)' },
]

/** Provider id → SvgIcon type (e.g. 'openai' → 'llm_openai') */
export const llmProviderIconTypes: Record<string, string> = llmProviders.reduce(
  (acc, p) => {
    acc[p.id] = `llm_${p.id}`
    return acc
  },
  {} as Record<string, string>
)

/** Infer provider from an API URL keyword (fallback for legacy configs) */
export function inferLLMProviderFromUrl(apiUrl: string): string {
  if (!apiUrl) return ''
  for (const p of llmProviders) {
    if (p.urlKeywords.some(k => apiUrl.includes(k))) return p.id
  }
  return ''
}
