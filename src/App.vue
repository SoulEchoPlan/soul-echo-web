<template>
  <div class="app-container" :class="themeClass">
    <TheHeader :current-theme="currentTheme" @toggle-theme="toggleTheme" />

    <div class="main-content">
      <NavSidebar />

      <RouterView />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import TheHeader from './components/TheHeader.vue'
import NavSidebar from './components/NavSidebar.vue' // 引入新导航
// CharacterList 和 ChatPanel 不再由 App.vue 直接管理
import { useCharacterStore } from './stores/character'

const characterStore = useCharacterStore()
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
  // characterStore.fetchCharacters() // 这个逻辑被 CharacterList.vue 自己管理了，App.vue 不再需要它
})
</script>

<style>
/* 全局样式已在 assets/main.css 中引入 */
</style>