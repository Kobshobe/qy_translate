<template>
  <div class="llm-page">
    <div class="llm-container">
      <!-- Header -->
      <header class="llm-header">
        <div class="llm-header__left">
          <h2 class="llm-header__title">{{ geti18nMsg('__llm__') }}</h2>
          <p class="llm-header__desc">{{ geti18nMsg('__manageAI__') }}</p>
          <div class="llm-header__notice">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>{{ geti18nMsg('__apiKeyLocalOnly__') }}</span>
          </div>
        </div>
        <x-button type="primary" @click="showAddDialog">+ {{ geti18nMsg('__addFirstLLM__') }}</x-button>
      </header>

      <!-- Empty State -->
      <div v-if="llmList.length === 0" class="llm-empty">
        <div class="llm-empty__icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a4 4 0 0 1 4 4c0 2-2 3-2 5h-4c0-2-2-3-2-5a4 4 0 0 1 4-4z"/>
            <path d="M12 12v4"/>
            <path d="M8 20h8"/>
            <path d="M12 16a2 2 0 0 0 2-2"/>
            <path d="M6 22h12"/>
          </svg>
        </div>
        <h3 class="llm-empty__title">{{ geti18nMsg('__noLLMConfig__') }}</h3>
        <p class="llm-empty__desc">{{ geti18nMsg('__noLLMDesc__') }}</p>
        <x-button type="primary" @click="showAddDialog">{{ geti18nMsg('__addFirstLLM__') }}</x-button>
      </div>

      <!-- Card Grid -->
      <div v-else class="llm-cards">
        <div v-for="item in llmList" :key="item.id" class="llm-card">
          <div class="llm-card__header">
            <div class="llm-card__info">
              <div class="llm-card__avatar" :style="{ background: avatarGradient(item.apiUrl) }">{{ item.name.charAt(0).toUpperCase() }}</div>
              <div class="llm-card__meta">
                <span class="llm-card__name">{{ item.name }}</span>
                <span class="llm-card__model-badge" :style="{ background: avatarGradient(item.apiUrl) }">{{ item.model }}</span>
              </div>
            </div>
            <div class="llm-card__actions">
              <button class="llm-card__action-btn" :title="geti18nMsg('__edit__')" @click="editItem(item)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                </svg>
              </button>
              <button class="llm-card__action-btn llm-card__action-btn--danger" :title="geti18nMsg('__delete__')" @click="deleteItem(item)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6h18"/>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="llm-card__body">
            <div class="llm-card__detail">
              <span class="llm-card__label">{{ geti18nMsg('__apiUrl__') }}</span>
              <span class="llm-card__value">{{ item.apiUrl }}</span>
            </div>
            <div class="llm-card__detail">
              <span class="llm-card__label">API Key</span>
              <span class="llm-card__value llm-card__value--mono">{{ maskApiKey(item.apiKey) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <x-dialog v-model="dialogVisible" :title="isEditing ? geti18nMsg('__editLLM__') : geti18nMsg('__addLLM__')" width="540px">
      <!-- Presets (only in add mode) -->
      <div v-if="!isEditing" class="dialog-preset">
        <label class="dialog-label">{{ geti18nMsg('__quickSelect__') }}</label>
        <div class="dialog-preset__grid">
          <button
            v-for="p in defaultProviders"
            :key="p.id"
            class="dialog-preset__item"
            :class="{ 'dialog-preset__item--active': selectedPreset === p.id }"
            @click="selectPreset(p)"
          >
            <img v-if="presetIcon(p.id)" class="dialog-preset__icon-img" :src="presetIcon(p.id)" :alt="p.id" />
            <span v-else class="dialog-preset__icon">{{ p.id.charAt(0).toUpperCase() }}</span>
            <span class="dialog-preset__name">{{ presetDisplayName(p.id) }}</span>
          </button>
        </div>
        <div class="dialog-divider"></div>
      </div>

      <!-- Form -->
      <div class="dialog-form">
        <div class="dialog-form__group">
          <label class="dialog-label">{{ geti18nMsg('__name__') }}</label>
          <x-input v-model="form.name" :placeholder="geti18nMsg('__namePlaceholder__')" />
        </div>
        <div class="dialog-form__group">
          <label class="dialog-label">{{ geti18nMsg('__apiUrl__') }}</label>
          <div class="dialog-form__row">
            <x-input v-model="form.apiUrl" :placeholder="geti18nMsg('__apiUrlPlaceholder__')" class="dialog-form__flex" />
            <x-button
              :disabled="testing"
              @click="testConnection"
              size="small"
            >{{ testing ? geti18nMsg('__testing__') : geti18nMsg('__testConn__') }}</x-button>
          </div>
        </div>
        <div class="dialog-form__group">
          <label class="dialog-label">API Key</label>
          <x-input v-model="form.apiKey" :placeholder="geti18nMsg('__apiKeyPlaceholder__')" />
          <div class="dialog-form__notice">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>{{ geti18nMsg('__apiKeyLocalOnly__') }}</span>
          </div>
        </div>
        <div class="dialog-form__group">
          <label class="dialog-label">{{ geti18nMsg('__modelName__') }}</label>
          <x-input v-model="form.model" :placeholder="geti18nMsg('__modelPlaceholder__')" />
          <div v-if="selectedPreset && !isEditing" class="dialog-model-suggestions">
            <span
              v-for="m in currentModels"
              :key="m"
              class="dialog-model-tag"
              :class="{ 'dialog-model-tag--active': form.model === m }"
              @click="form.model = m"
            >{{ m }}</span>
          </div>
        </div>
        <div class="dialog-form__group">
          <label class="dialog-label">{{ geti18nMsg('__customPrompt__') }}</label>
          <textarea
            v-model="form.customPrompt"
            class="dialog-textarea"
            :placeholder="geti18nMsg('__promptPlaceholder__')"
            rows="3"
          ></textarea>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <x-button @click="dialogVisible = false">{{ geti18nMsg('__cancel__') }}</x-button>
          <x-button type="primary" @click="saveItem">{{ geti18nMsg('__save__') }}</x-button>
        </div>
      </template>
    </x-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ILLMConfig, ILLMModels } from '@/interface/trans'
import { v4 as uuidv4 } from 'uuid'
import { XMessage } from '@/xxui/index'
import { geti18nMsg } from '@/utils/share'
import { eventToGoogle } from '@/utils/analytics'
const llmList = ref<ILLMConfig[]>([])
const dialogVisible = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)

const defaultProviders: ILLMModels[] = [
  { id: 'deepseek', baseUrl: 'https://api.deepseek.com/v1', models: ['deepseek-v4-flash', 'deepseek-v4-pro', 'deepseek-chat', 'deepseek-reasoner'] },
  { id: 'claude', baseUrl: 'https://api.anthropic.com/v1', models: ['claude-3-5-sonnet', 'claude-3-opus', 'claude-3-haiku', 'claude-3-sonnet'] },
  { id: 'openai', baseUrl: 'https://api.openai.com/v1', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'] },
  { id: 'minimax', baseUrl: 'https://api.minimax.chat/v1', models: ['MiniMax-M3', 'MiniMax-M2.7', 'MiniMax-M2.7-highspeed', 'MiniMax-M2.5', 'MiniMax-M2.5-highspeed', 'MiniMax-M2.1', 'MiniMax-M2.1-highspeed', 'MiniMax-M2'] },
  { id: 'glm', baseUrl: 'https://open.bigmodel.cn/api/paas/v4', models: ['glm-5', 'glm-5-turbo', 'glm-4.7', 'glm-4.7-flashx', 'glm-4.7-flash', 'glm-4.6', 'glm-4.5', 'glm-4.5-air', 'glm-4-flash'] },
  { id: 'qwen', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', models: ['qwen-plus', 'qwen-turbo', 'qwen-max'] },
]

const selectedPreset = ref<string | null>(null)
const currentModels = computed(() => {
  const p = defaultProviders.find(p => p.id === selectedPreset.value)
  return p ? p.models : []
})

const testing = ref(false)

const form = ref<ILLMConfig>({
  id: '',
  name: '',
  apiUrl: '',
  apiKey: '',
  model: '',
  customPrompt: '',
})

const STORAGE_KEY = 'llmConfigs'

function storageGet(key: string): Promise<any> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(key, (result) => {
      resolve(result)
    })
  })
}

function storageSet(data: Record<string, any>): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set(data, () => {
      resolve()
    })
  })
}

async function loadList() {
  console.log('[LLM] loadList 开始加载')
  const result = await storageGet(STORAGE_KEY)
  console.log('[LLM] storage 返回:', JSON.parse(JSON.stringify(result)))
  const data = result[STORAGE_KEY]
  console.log('[LLM] 原始数据类型:', typeof data, Array.isArray(data))
  llmList.value = Array.isArray(data) ? data : []
  console.log('[LLM] 加载完成, 列表长度:', llmList.value.length)
}

async function saveList() {
  // 深拷贝避免 Vue Proxy 序列化问题
  const raw = JSON.parse(JSON.stringify(llmList.value))
  console.log('[LLM] saveList 开始保存, 类型:', Array.isArray(raw), '长度:', raw.length)
  await storageSet({ [STORAGE_KEY]: raw })
  console.log('[LLM] saveList 保存完成')
}

function presetIcon(id: string): string {
  const icons: Record<string, string> = {
    claude: 'assets/images/claude.svg',
    openai: 'assets/images/openai.svg',
    deepseek: 'assets/images/deepseek.svg',
    minimax: 'assets/images/MiniMax.svg',
    glm: 'assets/images/glm.svg',
    qwen: 'assets/images/qwen.svg',
  }
  return icons[id] || ''
}

function selectPreset(p: ILLMModels) {
  selectedPreset.value = p.id
  form.value.name = presetDisplayName(p.id)
  form.value.apiUrl = p.baseUrl
  form.value.model = p.models[0]
}

function showAddDialog() {
  isEditing.value = false
  selectedPreset.value = null
  editingId.value = null
  form.value = { id: '', name: '', apiUrl: '', apiKey: '', model: '', customPrompt: '' }
  dialogVisible.value = true
}

function editItem(item: ILLMConfig) {
  isEditing.value = true
  editingId.value = item.id
  form.value = { ...item }
  dialogVisible.value = true
}

async function deleteItem(item: ILLMConfig) {
  const list = Array.isArray(llmList.value) ? llmList.value : []
  llmList.value = list.filter(i => i.id !== item.id)
  await saveList()

  // GA event
  eventToGoogle({
    name: 'delete_llm_engine',
    params: {
      engine_name: item.name,
      engine_model: item.model,
    },
  })

  // If the deleted engine is currently the default, fallback to Google Translate
  const { transEngine } = await chrome.storage.sync.get('transEngine')
  if (transEngine === 'llm__' + item.id) {
    await chrome.storage.sync.set({ transEngine: 'ggTrans__common' })
  }
}

async function saveItem() {
  console.log('[LLM] saveItem called', JSON.parse(JSON.stringify(form.value)))
  console.log('[LLM] isEditing:', isEditing.value, 'editingId:', editingId.value)

  if (!form.value.name) {
    console.warn('[LLM] 验证失败: 名称为空')
    XMessage({ message: '请输入名称', type: 'warning' })
    return
  }
  if (!form.value.apiUrl) {
    console.warn('[LLM] 验证失败: API 地址为空')
    XMessage({ message: '请输入 API 地址', type: 'warning' })
    return
  }
  if (!form.value.apiKey) {
    console.warn('[LLM] 验证失败: API Key 为空')
    XMessage({ message: '请输入 API Key', type: 'warning' })
    return
  }
  if (!form.value.model) {
    console.warn('[LLM] 验证失败: 模型为空')
    XMessage({ message: '请输入模型名称', type: 'warning' })
    return
  }

  try {
    console.log('[LLM] llmList.value 类型:', typeof llmList.value, Array.isArray(llmList.value))

    // 确保是数组（防止存储数据损坏）
    let list = Array.isArray(llmList.value) ? [...llmList.value] : []

    if (isEditing.value && editingId.value) {
      const index = list.findIndex(i => i.id === editingId.value)
      console.log('[LLM] 编辑模式, index:', index)
      if (index !== -1) {
        list[index] = { ...form.value, id: editingId.value }
      }
      llmList.value = list
    } else {
      const newId = uuidv4()
      console.log('[LLM] 新增模式, newId:', newId)
      list.unshift({ ...form.value, id: newId })
      llmList.value = list
    }

    console.log('[LLM] 准备保存到 storage, 列表长度:', list.length)
    await saveList()
    console.log('[LLM] storage 保存成功')
    dialogVisible.value = false
    XMessage({ message: '保存成功', type: 'success' })

    // GA event
    eventToGoogle({
      name: isEditing.value ? 'edit_llm_engine' : 'add_llm_engine',
      params: {
        engine_name: form.value.name,
        engine_model: form.value.model,
        engine_url: form.value.apiUrl.replace(/\/+$/, '').replace(/^https?:\/\//, '').split('/')[0] || form.value.apiUrl,
      },
    })
  } catch (e) {
    console.error('[LLM] 保存失败:', e)
    XMessage({ message: '保存失败: ' + (e as Error).message, type: 'error' })
  }
}

async function testConnection() {
  if (!form.value.apiUrl || !form.value.apiKey || !form.value.model) {
    XMessage({ message: '请先填写 API 地址、API Key 和模型', type: 'warning' })
    return
  }

  testing.value = true
  console.log('[LLM] 测试连接:', form.value.apiUrl, form.value.model)

  try {
    const url = form.value.apiUrl.replace(/\/+$/, '') + '/chat/completions'
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + form.value.apiKey,
      },
      body: JSON.stringify({
        model: form.value.model,
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 5,
      }),
    })

    if (resp.ok) {
      XMessage({ message: '连接成功！', type: 'success' })
    } else {
      const err = await resp.text()
      XMessage({ message: '连接失败: HTTP ' + resp.status, type: 'error' })
      console.error('[LLM] 测试连接失败:', resp.status, err)
    }
  } catch (e) {
    XMessage({ message: '连接失败: ' + (e as Error).message, type: 'error' })
    console.error('[LLM] 测试连接异常:', e)
  } finally {
    testing.value = false
  }
}

function maskApiKey(key: string): string {
  if (key.length <= 8) return '****'
  return key.slice(0, 4) + '****' + key.slice(-4)
}

function presetDisplayName(id: string): string {
  const names: Record<string, string> = {
    'deepseek': 'DeepSeek',
    'claude': 'Claude',
    'openai': 'OpenAI',
    'minimax': 'MiniMax',
    'glm': 'GLM',
    'qwen': 'Qwen',
  }
  return names[id] || id.charAt(0).toUpperCase() + id.slice(1)
}

function avatarGradient(apiUrl: string): string {
  const colors: Record<string, string> = {
    'deepseek': 'linear-gradient(135deg, #4D6BFE, #7B8EFF)',
    'openai': 'linear-gradient(135deg, #10A37F, #1EC99A)',
    'anthropic': 'linear-gradient(135deg, #D97757, #E8957D)',
    'minimax': 'linear-gradient(135deg, #D4367A, #ED6D48)',
    'minimaxi': 'linear-gradient(135deg, #D4367A, #ED6D48)',
    'bigmodel': 'linear-gradient(135deg, #5B6AF0, #7B8AF5)',
    'dashscope': 'linear-gradient(135deg, #615CED, #817CF0)',
  }
  for (const [key, color] of Object.entries(colors)) {
    if (apiUrl.includes(key)) return color
  }
  return 'linear-gradient(135deg, var(--xx-c-primary), #6c5ce7)'
}

onMounted(() => {
  loadList()
})
</script>

<style scoped lang="scss">
/* ==========================================
   Page Layout — max-width container, 8px base
   ========================================== */
.llm-page {
  box-sizing: border-box;
  width: 100%;
  padding: 48px 40px 120px;
  color: var(--xx-text-color-regular);
}

.llm-container {
  max-width: 800px;
  margin: 0 auto;
}

/* ==========================================
   Header — strong visual anchor
   ========================================== */
.llm-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 48px;

  &__left {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__title {
    font-size: 24px;
    font-weight: 700;
    margin: 0;
    color: var(--xx-text-color-regular);
  }

  &__desc {
    margin: 0;
    font-size: 14px;
    color: var(--xx-text-color-secondary);
  }

  &__notice {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 12px;
    padding: 8px 12px;
    font-size: 12px;
    line-height: 1.4;

    svg {
      flex-shrink: 0;
      color: var(--xx-c-primary);
    }
  }
}

/* ==========================================
   Empty State — centered visual anchor
   ========================================== */
.llm-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 96px 24px;
  border: 1px dashed var(--xx-border-color);
  border-radius: 12px;
  background: var(--xx-background-color);

  &__icon {
    color: var(--xx-text-color-secondary);
    opacity: 0.4;
    margin-bottom: 24px;
  }

  &__title {
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 8px;
    color: var(--xx-text-color-regular);
  }

  &__desc {
    font-size: 14px;
    margin: 0 0 28px;
    color: var(--xx-text-color-secondary);
    max-width: 340px;
  }
}

/* ==========================================
   Card Grid — 2-column on desktop
   ========================================== */
.llm-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

/* ==========================================
   Card — bordered container
   ========================================== */
.llm-card {
  border: 1px solid var(--xx-border-color);
  border-radius: 10px;
  padding: 20px;
  background: var(--xx-background-color);
  transition: box-shadow 0.2s, border-color 0.2s;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    border-color: var(--xx-c-primary);
  }

  /* ---- Header: avatar + name + actions ---- */
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  &__info {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }

  &__avatar {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    font-weight: 700;
    color: #fff;
    flex-shrink: 0;
  }

  &__meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  &__name {
    font-size: 15px;
    font-weight: 600;
    color: var(--xx-text-color-regular);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__model-badge {
    display: inline-block;
    font-size: 11px;
    font-weight: 500;
    padding: 1px 8px;
    border-radius: 4px;
    background: var(--xx-c-primary);
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 160px;
  }

  /* ---- Action buttons ---- */
  &__actions {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
  }

  &__action-btn {
    width: 28px;
    height: 28px;
    border: none;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--xx-text-color-secondary);
    background: transparent;
    transition: background 0.15s, color 0.15s;

    &:hover {
      background: var(--xx-border-color);
      color: var(--xx-text-color-regular);
    }

    &--danger:hover {
      background: rgba(245, 108, 108, 0.1);
      color: var(--xx-c-color-danger);
    }
  }

  /* ---- Body: detail rows ---- */
  &__body {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__detail {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__label {
    font-size: 11px;
    font-weight: 500;
    color: var(--xx-text-color-secondary);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  &__value {
    font-size: 13px;
    color: var(--xx-text-color-regular);
    word-break: break-all;
    line-height: 1.4;

    &--mono {
      font-family: ui-monospace, 'SF Mono', Menlo, monospace;
      letter-spacing: 0.02em;
    }
  }
}

/* ==========================================
   Dialog — preset grid + form
   ========================================== */
.dialog-preset {
  margin-bottom: 0;

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  &__item {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border: 1px solid var(--xx-border-color);
    border-radius: 8px;
    cursor: pointer;
    background: var(--xx-background-color);
    transition: all 0.15s;

    &:hover {
      border-color: var(--xx-c-primary);
      background: rgba(76, 139, 245, 0.04);
    }

    &--active {
      border-color: var(--xx-c-primary);
      background: rgba(76, 139, 245, 0.08);
    }
  }

  &__icon-img {
    width: 28px;
    height: 28px;
    object-fit: contain;
    flex-shrink: 0;
  }

  &__icon {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    color: #fff;
    background: linear-gradient(135deg, var(--xx-c-primary), #6c5ce7);
    flex-shrink: 0;
  }

  &__name {
    font-size: 13px;
    font-weight: 600;
    color: var(--xx-text-color-regular);
  }
}

.dialog-divider {
  height: 1px;
  background: var(--xx-border-color);
  margin: 16px 0;
}

.dialog-form {
  &__group {
    margin-bottom: 16px;
  }

  &__row {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  &__flex {
    flex: 1;
  }

  &__notice {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
    padding: 8px 12px;
    font-size: 12px;
    line-height: 1.4;

    svg {
      flex-shrink: 0;
      color: var(--xx-c-primary);
    }
  }
}

.dialog-label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--xx-text-color-regular);
}

.dialog-model-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.dialog-model-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  font-size: 12px;
  font-family: ui-monospace, 'SF Mono', Menlo, monospace;
  border: 1px solid var(--xx-border-color);
  border-radius: 6px;
  cursor: pointer;
  color: var(--xx-text-color-secondary);
  background: var(--xx-background-color);
  transition: all 0.15s;

  &:hover {
    border-color: var(--xx-c-primary);
    color: var(--xx-c-primary);
  }

  &--active {
    border-color: var(--xx-c-primary);
    background: var(--xx-c-primary);
    color: #fff;
  }
}

.dialog-textarea {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  padding: 8px 12px;
  font-size: 13px;
  border: 1px solid var(--xx-border-color);
  border-radius: 6px;
  background: var(--xx-background-color);
  color: var(--xx-text-color-regular);
  resize: vertical;
  outline: none;
  font-family: inherit;
  &:focus {
    border-color: var(--xx-c-primary);
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;

  .xx-button {
    min-width: 88px;
  }
}

/* ==========================================
   Responsive — tablet / mobile
   ========================================== */
@media (max-width: 768px) {
  .llm-page {
    padding: 32px 20px 80px;
  }

  .llm-header {
    flex-direction: column;
    gap: 16px;
    margin-bottom: 32px;
  }

  .llm-cards {
    grid-template-columns: 1fr;
  }

  .dialog-preset__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 480px) {
  .dialog-preset__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
