<template>
  <header class="app-header">
    <h1 class="logo">魂语计划</h1>
    <button class="theme-switcher" @click="$emit('toggle-theme')">
      <i :data-feather="props.theme === 'dark' ? 'sun' : 'moon'"></i>
      <span>{{ props.theme === 'dark' ? '亮色' : '暗色' }}</span>
    </button>
  </header>
</template>

<script setup>
import { onMounted } from 'vue'
import feather from 'feather-icons'

const props = defineProps({
  theme: String
})

defineEmits(['toggle-theme'])

onMounted(() => {
  // 初始化feather图标
  feather.replace()
})
</script>

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: var(--panel-bg);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.app-header .logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
}

.theme-switcher {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: var(--secondary-bg);
  border-radius: 999px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.theme-switcher:hover {
  background-color: var(--border-color);
}
</style>