<template>
  <div class="settings-container">
    <div class="settings-sidebar">
      <router-link to="/settings/trans" class="sidebar-item" :class="{ active: $route.path === '/settings/trans' }">
        {{ geti18nMsg('__basicOptions__') }}
      </router-link>
      <router-link to="/settings/page-trans" class="sidebar-item" :class="{ active: $route.path === '/settings/page-trans' }">
        {{ geti18nMsg('__pageTrans__') }}
        <span class="beta-badge">BETA</span>
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
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 24px;
  font-size: 14px;
  color: var(--xx-text-color-regular);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 3px solid transparent;

  .beta-badge {
    display: inline-block;
    font-size: 10px;
    font-weight: 600;
    line-height: 1;
    padding: 2px 5px;
    border-radius: 3px;
    color: #fff;
    background: $mainColor;
    vertical-align: middle;
  }

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
