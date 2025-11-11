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
  gap: 1rem;
  overflow: hidden;
}

/* 覆盖 CharacterList 的 flex: 1，使其宽度受控 */
:deep(.sidebar) {
  flex: 1;
  min-width: 280px; /* 保持最小宽度 */
  max-width: 360px; /* 限制最大宽度 */
}

/* 覆盖 ChatPanel 的 flex: 3，使其填充剩余空间 */
:deep(.chat-panel) {
  flex: 3;
}
</style>