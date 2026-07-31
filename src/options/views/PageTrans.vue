<template>
  <div class="page-trans-container">
    <h2 class="page-trans-title">{{ geti18nMsg('__pageTrans__') }} <span class="beta-badge">BETA</span></h2>

    <!-- 悬浮球设置 -->
    <section class="page-trans-section">
      <h3 class="section-title">{{ geti18nMsg('__floatingBall__') || '悬浮球' }}</h3>
      <div class="section-body">
        <div class="setting-row">
          <span class="setting-label">{{ geti18nMsg('__showFloatingBall__') || '显示悬浮球' }}</span>
          <x-switch v-model="hook.OP.conf.C.fbVisible" @change="hook.OP.conf.changeFbVisible" />
        </div>
        <div class="setting-row">
          <span class="setting-label">{{ geti18nMsg('__defaultSide__') || '默认吸附位置' }}</span>
          <div class="radio-group">
            <x-radio v-model="hook.OP.conf.C.fbDefaultSide" label="left" @change="hook.OP.conf.changeFbSide">{{ geti18nMsg('__leftSide__') || '左侧' }}</x-radio>
            <x-size-box width="20px" />
            <x-radio v-model="hook.OP.conf.C.fbDefaultSide" label="right" @change="hook.OP.conf.changeFbSide">{{ geti18nMsg('__rightSide__') || '右侧' }}</x-radio>
          </div>
        </div>
      </div>
    </section>

    <!-- 译文样式 -->
    <section class="page-trans-section">
      <h3 class="section-title">{{ geti18nMsg('__transStyle__') || '译文样式' }}</h3>
      <div class="section-body">
        <div class="setting-row">
          <span class="setting-label">{{ geti18nMsg('__displayMode__') || '显示模式' }}</span>
          <div class="radio-group">
            <x-radio v-model="hook.OP.conf.C.pageTransDisplayMode" label="bilingual" @change="hook.OP.conf.changePageTransDisplayMode">{{ geti18nMsg('__bilingual__') || '双语' }}</x-radio>
            <x-size-box width="20px" />
            <x-radio v-model="hook.OP.conf.C.pageTransDisplayMode" label="targetOnly" @change="hook.OP.conf.changePageTransDisplayMode">{{ geti18nMsg('__targetOnly__') || '仅译文' }}</x-radio>
          </div>
        </div>

        <div class="style-grid">
          <div
            v-for="style in styleList"
            :key="style.id"
            class="style-card"
            :class="{ active: hook.OP.conf.C.pageTransStyle === style.id }"
            @click="hook.OP.conf.C.pageTransStyle = style.id; hook.OP.conf.changePageTransStyle()"
          >
            <div class="style-preview" :class="style.previewClass">
              <span class="preview-original">Hello world</span>
              <span class="preview-trans">你好世界</span>
            </div>
            <div class="style-name">{{ style.label }}</div>
          </div>
        </div>

        <div class="setting-row" style="margin-top: 20px;">
          <span class="setting-label">{{ geti18nMsg('__dimOriginal__') || '淡化原文' }}</span>
          <x-switch v-model="hook.OP.conf.C.pageTransDimOriginal" @change="hook.OP.conf.changePageTransDimOriginal" />
          <span class="setting-hint">{{ geti18nMsg('__dimOriginalHint__') || '双语模式下原文变淡，突出译文' }}</span>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { IOptionBaseHook } from '@/interface/options'
import { geti18nMsg } from '@/utils/share'

const hook = inject('baseHook') as IOptionBaseHook

const styleList = [
  { id: 'none', label: geti18nMsg('__styleNone__') || '无样式', previewClass: 'preview-none' },
  { id: 'underline', label: geti18nMsg('__styleUnderline__') || '下划线', previewClass: 'preview-underline' },
  { id: 'dashed', label: geti18nMsg('__styleDashed__') || '虚线', previewClass: 'preview-dashed' },
  { id: 'dotted', label: geti18nMsg('__styleDotted__') || '点线', previewClass: 'preview-dotted' },
  { id: 'highlight', label: geti18nMsg('__styleHighlight__') || '高亮', previewClass: 'preview-highlight' },
  { id: 'marker', label: geti18nMsg('__styleMarker__') || '马克笔', previewClass: 'preview-marker' },
  { id: 'bgColor', label: geti18nMsg('__styleBgColor__') || '背景色', previewClass: 'preview-bgColor' },
  { id: 'border', label: geti18nMsg('__styleBorder__') || '左边框', previewClass: 'preview-border' },
  { id: 'blur', label: geti18nMsg('__styleBlur__') || '模糊', previewClass: 'preview-blur' },
]
</script>

<style scoped lang="scss">
.page-trans-container {
  padding: 40px 60px 150px 60px;
  max-width: 800px;
}

.page-trans-title {
  font-size: 20px;
  color: var(--xx-text-color-primary);
  margin: 0 0 32px 0;
  display: flex;
  align-items: center;
  gap: 8px;

  .beta-badge {
    display: inline-block;
    font-size: 11px;
    font-weight: 600;
    line-height: 1;
    padding: 3px 7px;
    border-radius: 3px;
    color: #fff;
    background: $mainColor;
    vertical-align: middle;
  }
}

.page-trans-section {
  margin-bottom: 36px;

  .section-title {
    font-size: 15px;
    font-weight: bold;
    color: var(--xx-text-color-regular);
    margin: 0 0 16px 0;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--xx-border-color);
  }

  .section-body {
    padding: 0 4px;
  }
}

.setting-row {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 16px;
}

.setting-label {
  font-size: 14px;
  color: var(--xx-text-color-regular);
  min-width: 120px;
}

.setting-hint {
  font-size: 12px;
  color: var(--xx-text-color-placeholder);
}

.radio-group {
  display: flex;
  align-items: center;
}

/* 样式选择网格 */
.style-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.style-card {
  border: 2px solid var(--xx-border-color);
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--xx-background-color);

  &:hover {
    border-color: $mainColor;
    box-shadow: 0 2px 8px rgba($mainColor, 0.15);
  }

  &.active {
    border-color: $mainColor;
    box-shadow: 0 0 0 2px rgba($mainColor, 0.2);
  }
}

.style-preview {
  font-size: 12px;
  line-height: 1.5;
  margin-bottom: 8px;
  padding: 6px;
  border-radius: 4px;
  background: var(--xx-fill-color);
  min-height: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .preview-original {
    color: var(--xx-text-color-placeholder);
    text-decoration: none;
  }
  .preview-trans {
    color: var(--xx-text-color-regular);
  }
}

.style-name {
  font-size: 12px;
  text-align: center;
  color: var(--xx-text-color-regular);
}

/* 各种样式预览 */
.preview-none .preview-trans {
  color: inherit;
  background: none;
  text-decoration: none;
}

.preview-underline .preview-trans {
  text-decoration: underline;
  text-decoration-color: $mainColor;
  text-underline-offset: 2px;
}

.preview-dashed .preview-trans {
  border-bottom: 1px dashed $mainColor;
  padding-bottom: 1px;
}

.preview-dotted .preview-trans {
  text-decoration: underline dotted $mainColor;
  text-underline-offset: 2px;
}

.preview-highlight .preview-trans {
  background: linear-gradient(180deg, transparent 55%, rgba($mainColor, 0.25) 55%);
  padding: 0 2px;
}

.preview-marker .preview-trans {
  background: rgba($mainColor, 0.15);
  border-radius: 2px;
  padding: 0 3px;
}

.preview-bgColor .preview-trans {
  background-color: rgba($mainColor, 0.08);
  border-radius: 3px;
  padding: 1px 4px;
}

.preview-border .preview-trans {
  border-left: 3px solid $mainColor;
  padding-left: 8px;
  align-self: stretch;
}

.preview-blur .preview-trans {
  filter: blur(3px);
  transition: filter 0.2s;
  cursor: pointer;
}
.preview-blur:hover .preview-trans {
  filter: none;
}

.placeholder-text {
  color: var(--xx-text-color-placeholder);
  font-size: 13px;
}
</style>
