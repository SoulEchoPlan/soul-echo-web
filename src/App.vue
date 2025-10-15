<template>
  <div class="app-container" :class="themeClass">
    <TheHeader />
    <div class="main-content">
      <CharacterList />
      <ChatPanel />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import TheHeader from './components/TheHeader.vue'
import CharacterList from './components/sidebar/CharacterList.vue'
import ChatPanel from './components/chat/ChatPanel.vue'
import { useCharacterStore } from './stores/character'

const characterStore = useCharacterStore()

const currentTheme = ref('dark')

const themeClass = computed(() => {
  return `${currentTheme.value}-mode`
})

onMounted(() => {
  // 设置初始主题
  currentTheme.value = 'light'
  document.body.classList.add('light-mode')

  // 初始化角色数据
  characterStore.fetchCharacters()
})
</script>

<style>
/* 全局样式已在 assets/main.css 中引入 */
</style>