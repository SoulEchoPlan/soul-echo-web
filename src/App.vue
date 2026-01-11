<template>
  <div class="app-container" :class="themeClass">
    <TheHeader :current-theme="currentTheme" @toggle-theme="toggleTheme" />

    <div class="main-content">
      <NavSidebar />

      <RouterView />
    </div>

    <!-- 全局 Toast 组件 -->
    <ToastMessage
      :visible="toastStore.visible"
      :message="toastStore.message"
      :type="toastStore.type"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import TheHeader from './components/TheHeader.vue'
import NavSidebar from './components/NavSidebar.vue' // 引入新导航
import ToastMessage from './components/common/ToastMessage.vue'
import { useToastStore } from './stores/toast'
import { useCharacterStore } from './stores/character'

const characterStore = useCharacterStore()
const toastStore = useToastStore()
const currentTheme = ref('dark')
const themeClass = computed(() => `${currentTheme.value}-mode`)

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

  // 将 Toast Store 挂载到全局 window 对象，方便在非组件文件中调用
  window.$toast = toastStore
})
</script>

<style>
/* 全局样式已在 assets/main.css 中引入 */
</style>