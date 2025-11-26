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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 覆盖 CharacterList 的 flex: 1，使其宽度受控 */
:deep(.sidebar) {
  flex: 0 0 260px; /* 固定宽度 260px */
  min-width: 260px;   /* 强制最小宽度 */
  max-width: 260px;   /* 强制最大宽度 */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 覆盖 ChatPanel 的 flex: 3，使其填充剩余空间 */
:deep(.chat-panel) {
  flex: 1;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>