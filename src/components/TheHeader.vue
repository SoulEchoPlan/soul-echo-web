<template>
  <header class="app-header">
    <div class="logo-container">
      <Bot class="logo-icon" />
      <h1 class="logo">魂语计划</h1>
    </div>
    <button class="theme-switcher" @click="$emit('toggle-theme')">
      <i :data-feather="props.currentTheme === 'dark' ? 'sun' : 'moon'"></i>
      <span>{{ props.currentTheme === 'dark' ? '亮色' : '暗色' }}</span>
    </button>
  </header>
</template>

<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import feather from 'feather-icons'
import { Bot } from 'lucide-vue-next'

// 接收props
const props = defineProps({
  currentTheme: {
    type: String,
    required: true
  }
})

// 接收emit
const emit = defineEmits(['toggle-theme'])

const updateThemeSwitcherUI = () => {
  const iconEl = document.querySelector('.theme-switcher i')
  if (iconEl) {
    iconEl.setAttribute('data-feather', props.currentTheme === 'dark' ? 'sun' : 'moon')
    feather.replace()
  }
}

// 监听主题变化
watch(() => props.currentTheme, () => {
  updateThemeSwitcherUI()
})

onMounted(() => {
  // 初始化feather图标
  feather.replace()
  updateThemeSwitcherUI()
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

.logo-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  color: var(--accent-color);
}

.app-header .logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
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