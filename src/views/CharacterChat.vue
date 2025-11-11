<template>
  <div id="page-chat" class="h-full">
    <!-- 角色选择界面 -->
    <CharacterSelection
      v-show="!showChatInterface"
      @character-selected="handleCharacterSelected"
    />

    <!-- 聊天界面 -->
    <ChatInterface
      v-show="showChatInterface"
      :character="selectedCharacter"
      @back-to-selection="handleBackToSelection"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CharacterSelection from '../components/CharacterSelection.vue'
import ChatInterface from '../components/ChatInterface.vue'

// 状态管理
const showChatInterface = ref(false)
const selectedCharacter = ref(null)

// 处理角色选择事件
const handleCharacterSelected = (character) => {
  selectedCharacter.value = character
  showChatInterface.value = true
}

// 处理返回角色选择界面事件
const handleBackToSelection = () => {
  showChatInterface.value = false
  selectedCharacter.value = null
}
</script>