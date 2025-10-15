<template>
  <header class="app-header">
    <h1 class="logo">魂语计划</h1>
    <button class="theme-switcher" @click="toggleTheme">
      <i :data-feather="currentTheme === 'dark' ? 'sun' : 'moon'"></i>
      <span>{{ currentTheme === 'dark' ? '亮色' : '暗色' }}</span>
    </button>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import feather from 'feather-icons'

const currentTheme = ref('dark')

const toggleTheme = () => {
  currentTheme.value = currentTheme.value === 'dark' ? 'light' : 'dark'
  document.body.classList.toggle('dark-mode')
  document.body.classList.toggle('light-mode')
  updateThemeSwitcherUI()
}

const updateThemeSwitcherUI = () => {
  const iconEl = document.querySelector('.theme-switcher i')
  if (iconEl) {
    iconEl.setAttribute('data-feather', currentTheme.value === 'dark' ? 'sun' : 'moon')
    feather.replace()
  }
}

onMounted(() => {
  // 设置初始主题
  currentTheme.value = document.body.classList.contains('dark-mode') ? 'dark' : 'light'
  updateThemeSwitcherUI()
  // 初始化feather图标
  feather.replace()
})

onUnmounted(() => {
  // 清理工作
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