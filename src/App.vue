<template>
  <div class="app-container" :class="themeClass">
    <TheHeader :current-theme="currentTheme" @toggle-theme="toggleTheme" />

    <div class="main-content">
      <NavSidebar />

      <RouterView />
    </div>

    <!-- 全局 Toast 组件 -->
    <ToastMessage
      :visible="toastState.visible"
      :message="toastState.message"
      :type="toastState.type"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import TheHeader from './components/TheHeader.vue'
import NavSidebar from './components/NavSidebar.vue' // 引入新导航
import ToastMessage from './components/common/ToastMessage.vue'
// CharacterList 和 ChatPanel 不再由 App.vue 直接管理
import { useCharacterStore } from './stores/character'

const characterStore = useCharacterStore()
const currentTheme = ref('dark')
const themeClass = computed(() => `${currentTheme.value}-mode`)

// Toast 状态管理
const toastState = ref({
  visible: false,
  message: '',
  type: 'info' // info | success | warning | error
})

let toastTimer = null

/**
 * 显示 Toast 消息
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型: 'info' | 'success' | 'warning' | 'error'
 * @param {number} duration - 显示时长（毫秒），默认 3000ms
 */
const showToast = (message, type = 'info', duration = 3000) => {
  // 清除之前的定时器
  if (toastTimer) {
    clearTimeout(toastTimer)
  }

  // 更新状态
  toastState.value = {
    visible: true,
    message,
    type
  }

  // 自动隐藏
  toastTimer = setTimeout(() => {
    toastState.value.visible = false
  }, duration)
}

// 主题切换方法
const toggleTheme = () => {
  currentTheme.value = currentTheme.value === 'dark' ? 'light' : 'dark'

  // 替换body的class，而不是toggle
  if (currentTheme.value === 'dark') {
    document.body.classList.remove('light-mode')
    document.body.classList.add('dark-mode')
  } else {
    document.body.classList.remove('dark-mode')
    document.body.classList.add('light-mode')
  }
}

onMounted(() => {
  // 自动主题检测：检查系统偏好
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  if (prefersDark) {
    currentTheme.value = 'dark'
    document.body.classList.add('dark-mode')
  } else {
    currentTheme.value = 'light'
    document.body.classList.add('light-mode')
  }
  // characterStore.fetchCharacters() // 这个逻辑被 CharacterList.vue 自己管理了，App.vue 不再需要它

  // 将 showToast 挂载到全局 window 对象，方便在非组件文件中调用
  window.$toast = showToast
})
</script>

<style>
/* 全局样式已在 assets/main.css 中引入 */
</style>