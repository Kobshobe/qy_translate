<template>
  <div class="settings-container">
    <div class="settings-sidebar">
      <router-link to="/settings/trans" class="sidebar-item" :class="{ active: $route.path === '/settings/trans' }">
        {{ geti18nMsg('__basicOptions__') }}
      </router-link>
      <router-link to="/settings/page-trans" class="sidebar-item" :class="{ active: $route.path === '/settings/page-trans' }">
        {{ geti18nMsg('__pageTrans__') }}
      </router-link>
    </div>
    <div class="settings-content">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { geti18nMsg } from '@/utils/share'
</script>

<style scoped lang="scss">
.settings-container {
  display: flex;
  width: 100%;
  height: 100%;
}

.settings-sidebar {
  width: 180px;
  min-width: 180px;
  padding-top: 40px;
  border-right: 1px solid var(--xx-border-color);
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.sidebar-item {
  display: block;
  padding: 12px 24px;
  font-size: 14px;
  color: var(--xx-text-color-regular);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 3px solid transparent;

  &:hover {
    color: $mainColor;
    background: var(--xx-fill-color);
  }

  &.active {
    color: $mainColor;
    border-left-color: $mainColor;
    background: var(--xx-fill-color);
    font-weight: bold;
  }
}

.settings-content {
  flex: 1;
  overflow-y: auto;
}
</style>
