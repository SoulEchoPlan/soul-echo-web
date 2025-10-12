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

<style scoped>
.chat-panel {
  display: flex;
  flex-direction: column;
  flex: 3;
  background-color: var(--panel-bg);
  border-radius: 12px;
  box-shadow: var(--shadow);
  overflow: hidden;
}

.character-indicator {
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}
</style>