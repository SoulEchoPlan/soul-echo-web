<template>
  <div class="chat-view-container">
    <CharacterList />
    <ChatPanel />
  </div>
</template>

<script setup>
import CharacterList from '@/components/sidebar/CharacterList.vue'
import ChatPanel from '@/components/chat/ChatPanel.vue'
</script>

<style scoped>
.chat-view-container {
  display: flex;
  flex: 1;
  gap: 0.75rem;
  overflow: hidden;
}

/* 覆盖 CharacterList 的 flex: 1，使其宽度受控 */
:deep(.sidebar) {
  flex: 0 0 320px; /* 使用固定的基准宽度 */
}

/* 覆盖 ChatPanel 的 flex: 3，使其填充剩余空间 */
:deep(.chat-panel) {
  flex: 1;
}
</style>