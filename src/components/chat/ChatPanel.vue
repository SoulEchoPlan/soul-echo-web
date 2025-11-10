<template>
  <main class="chat-panel">
    <div class="character-indicator">
      当前角色：{{ activeCharacter?.name || '未选择角色' }}
    </div>
    <ChatHistory />
    <ChatInput />
  </main>
</template>

<script setup>
import { computed } from 'vue'
import { useCharacterStore } from '@/stores/character'
import ChatHistory from './ChatHistory.vue'
import ChatInput from './ChatInput.vue'

const characterStore = useCharacterStore()

const activeCharacter = computed(() => characterStore.activeCharacter)
</script>

