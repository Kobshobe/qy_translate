<template>
  <div class="llm-page">
    <div class="llm-header">
      <h2>大模型</h2>
      <x-button type="primary" @click="showAddDialog">添加大模型</x-button>
    </div>

    <div v-if="llmList.length === 0" class="llm-empty">
      <p>暂无大模型配置，点击上方按钮添加</p>
    </div>

    <div v-else class="llm-list">
      <div v-for="item in llmList" :key="item.id" class="llm-card">
        <div class="llm-card__header">
          <span class="llm-card__name">{{ item.name }}</span>
          <div class="llm-card__actions">
            <span class="llm-card__action" @click="editItem(item)">编辑</span>
            <span class="llm-card__action llm-card__action--danger" @click="deleteItem(item)">删除</span>
          </div>
        </div>
        <div class="llm-card__body">
          <div class="llm-card__row">
            <span class="llm-card__label">API 地址：</span>
            <span class="llm-card__value">{{ item.apiUrl }}</span>
          </div>
          <div class="llm-card__row">
            <span class="llm-card__label">API Key：</span>
            <span class="llm-card__value">{{ maskApiKey(item.apiKey) }}</span>
          </div>
          <div class="llm-card__row">
            <span class="llm-card__label">模型：</span>
            <span class="llm-card__value">{{ item.model }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Dialog -->
    <x-dialog v-model="dialogVisible" :title="isEditing ? '编辑大模型' : '添加大模型'" width="540px">
      <div class="preset-section" v-if="!isEditing">
        <label class="form-label">快速选择</label>
        <div class="preset-list">
          <div
            v-for="p in defaultProviders"
            :key="p.id"
            class="preset-tag"
            :class="{ 'preset-tag--active': selectedPreset === p.id }"
            @click="selectPreset(p)"
          >
            {{ p.id }}
          </div>
        </div>
      </div>

      <div class="form-item">
        <label class="form-label">名称</label>
        <x-input v-model="form.name" placeholder="例如：DeepSeek、ChatGPT" />
      </div>
      <div class="form-item">
        <label class="form-label">API 地址</label>
        <x-input v-model="form.apiUrl" placeholder="例如：https://api.deepseek.com/v1" />
      </div>
      <div class="form-item">
        <label class="form-label">API Key</label>
        <x-input v-model="form.apiKey" placeholder="请输入 API Key" />
      </div>
      <div class="form-item">
        <label class="form-label">模型</label>
        <x-input v-model="form.model" placeholder="例如：deepseek-chat、gpt-4o" />
        <div class="model-suggestions" v-if="selectedPreset && !isEditing">
          <span
            v-for="m in currentModels"
            :key="m"
            class="model-suggestion-tag"
            :class="{ 'model-suggestion-tag--active': form.model === m }"
            @click="form.model = m"
          >{{ m }}</span>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <x-button @click="dialogVisible = false">取消</x-button>
          <x-button type="primary" @click="saveItem">保存</x-button>
        </div>
      </template>
    </x-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ILLMConfig, ILLMModels } from '@/interface/trans'
import { v4 as uuidv4 } from 'uuid'

const llmList = ref<ILLMConfig[]>([])
const dialogVisible = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)

const defaultProviders: ILLMModels[] = [
  { id: 'deepseek', baseUrl: 'https://api.deepseek.com/v1', models: ['deepseek-v4-flash', 'deepseek-v4-pro', 'deepseek-chat', 'deepseek-reasoner'] },
  { id: 'qwen', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', models: ['qwen-plus', 'qwen-turbo', 'qwen-max'] },
]

const selectedPreset = ref<string | null>(null)
const currentModels = computed(() => {
  const p = defaultProviders.find(p => p.id === selectedPreset.value)
  return p ? p.models : []
})

const form = ref<ILLMConfig>({
  id: '',
  name: '',
  apiUrl: '',
  apiKey: '',
  model: '',
})

const STORAGE_KEY = 'llmConfigs'

async function loadList() {
  const result = await chrome.storage.sync.get(STORAGE_KEY)
  llmList.value = (result[STORAGE_KEY] as ILLMConfig[]) || []
}

async function saveList() {
  await chrome.storage.sync.set({ [STORAGE_KEY]: llmList.value })
}

function selectPreset(p: ILLMModels) {
  selectedPreset.value = p.id
  form.value.name = p.id.charAt(0).toUpperCase() + p.id.slice(1)
  form.value.apiUrl = p.baseUrl
  form.value.model = p.models[0]
}

function showAddDialog() {
  isEditing.value = false
  selectedPreset.value = null
  editingId.value = null
  form.value = { id: '', name: '', apiUrl: '', apiKey: '', model: '' }
  dialogVisible.value = true
}

function editItem(item: ILLMConfig) {
  isEditing.value = true
  editingId.value = item.id
  form.value = { ...item }
  dialogVisible.value = true
}

async function deleteItem(item: ILLMConfig) {
  llmList.value = llmList.value.filter(i => i.id !== item.id)
  await saveList()
}

async function saveItem() {
  if (!form.value.name || !form.value.apiUrl || !form.value.apiKey || !form.value.model) {
    return
  }

  if (isEditing.value && editingId.value) {
    const index = llmList.value.findIndex(i => i.id === editingId.value)
    if (index !== -1) {
      llmList.value[index] = { ...form.value, id: editingId.value }
    }
  } else {
    llmList.value.push({ ...form.value, id: uuidv4() })
  }

  await saveList()
  dialogVisible.value = false
}

function maskApiKey(key: string): string {
  if (key.length <= 8) return '****'
  return key.slice(0, 4) + '****' + key.slice(-4)
}

onMounted(() => {
  loadList()
})
</script>

<style scoped lang="scss">
.llm-page {
  box-sizing: border-box;
  width: 100%;
  padding: 70px 0 150px 100px;
  color: var(--xx-text-color-regular);
}

.llm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 40px;
  h2 {
    font-size: 18px;
  }
}

.llm-empty {
  p {
    font-size: 14px;
    color: var(--xx-text-color-secondary);
  }
}

.llm-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.llm-card {
  border: 1px solid var(--xx-border-color);
  border-radius: 8px;
  padding: 20px;
  background: var(--xx-background-color);
  transition: box-shadow 0.2s;
  &:hover {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  &__name {
    font-size: 16px;
    font-weight: bold;
  }

  &__actions {
    display: flex;
    gap: 12px;
  }

  &__action {
    font-size: 13px;
    cursor: pointer;
    color: var(--xx-c-primary);
    &:hover {
      opacity: 0.8;
    }
    &--danger {
      color: var(--xx-c-color-danger);
    }
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__row {
    display: flex;
    font-size: 14px;
  }

  &__label {
    color: var(--xx-text-color-secondary);
    min-width: 80px;
    flex-shrink: 0;
  }

  &__value {
    color: var(--xx-text-color-regular);
    word-break: break-all;
  }
}

.preset-section {
  margin-bottom: 24px;
}

.preset-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preset-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 14px;
  font-size: 13px;
  border: 1px solid var(--xx-border-color);
  border-radius: 16px;
  cursor: pointer;
  color: var(--xx-text-color-regular);
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

.model-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.model-suggestion-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  font-size: 12px;
  border: 1px solid var(--xx-border-color);
  border-radius: 12px;
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

.form-item {
  margin-bottom: 20px;
  .form-label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    color: var(--xx-text-color-regular);
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
