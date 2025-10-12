<template>
  <div class="chat-history" ref="chatHistoryRef">
    <!-- 角色问候信息 -->
    <div v-if="showGreeting" class="greeting-wrapper">
      <div class="char-name">{{ activeCharacter?.name }}</div>
      <div class="char-greeting">
        {{ activeCharacter?.personaPrompt ? activeCharacter.personaPrompt.substring(0, 100) + '...' : `你好，我是${activeCharacter?.name}` }}
      </div>
    </div>

    <!-- 聊天消息 -->
    <div
      v-for="message in messages"
      :key="message.timestamp"
      class="message"
      :class="message.type"
    >
      <div class="message-content">
        {{ message.content }}
      </div>
    </div>

    <!-- 连接状态提示 -->
    <div v-if="showConnectionStatus" class="connection-status">
      {{ connectionStatusText }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useCharacterStore } from '@/stores/character'

const chatStore = useChatStore()
const characterStore = useCharacterStore()
const chatHistoryRef = ref(null)

const messages = computed(() => chatStore.activeConversationMessages)
const activeCharacter = computed(() => characterStore.activeCharacter)
const isConnected = computed(() => chatStore.isConnected)
const isConnecting = computed(() => chatStore.isConnecting)

const showGreeting = computed(() => {
  return activeCharacter.value && messages.value.length === 0
})

const showConnectionStatus = computed(() => {
  return isConnecting.value || (!isConnected.value && activeCharacter.value)
})

const connectionStatusText = computed(() => {
  if (isConnecting.value) {
    return '正在连接...'
  } else if (!isConnected.value && activeCharacter.value) {
    return '连接已断开，请重新选择角色'
  }
  return ''
})

// 自动滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (chatHistoryRef.value) {
      chatHistoryRef.value.scrollTop = chatHistoryRef.value.scrollHeight
    }
  })
}

// 监听消息变化，自动滚动
watch(messages, () => {
  scrollToBottom()
}, { deep: true })

// 监听角色变化，滚动到顶部
watch(activeCharacter, () => {
  nextTick(() => {
    if (chatHistoryRef.value) {
      chatHistoryRef.value.scrollTop = 0
    }
  })
})

// 监听连接状态变化，滚动到显示状态信息
watch([isConnecting, isConnected], () => {
  scrollToBottom()
})
</script>

<style scoped>
.chat-history {
  flex-grow: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.greeting-wrapper .char-name {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.greeting-wrapper .char-greeting {
  background-color: var(--secondary-bg);
  padding: 1.5rem;
  border-radius: 10px;
  line-height: 1.7;
  font-size: 1.1rem;
  width: fit-content;
  max-width: 80%;
}

.message {
  margin-bottom: 1rem;
}

.message.user {
  display: flex;
  justify-content: flex-end;
}

.message.user .message-content {
  background-color: var(--accent-color);
  color: white;
  padding: 1rem;
  border-radius: 8px;
  max-width: 70%;
  width: fit-content;
  margin-left: auto;
}

.message.ai .message-content {
  background-color: var(--secondary-bg);
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  line-height: 1.5;
  width: fit-content;
  max-width: 80%;
}

.message.error .message-content {
  background-color: #dc3545;
  color: white;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  line-height: 1.5;
  width: fit-content;
  max-width: 80%;
}

.connection-status {
  padding: 1rem;
  background-color: var(--secondary-bg);
  border-radius: 8px;
  text-align: center;
  color: var(--text-muted);
  font-style: italic;
}

/* 自定义滚动条 */
.chat-history::-webkit-scrollbar {
  width: 6px;
}

.chat-history::-webkit-scrollbar-track {
  background: transparent;
}

.chat-history::-webkit-scrollbar-thumb {
  background-color: var(--border-color);
  border-radius: 3px;
}

.chat-history::-webkit-scrollbar-thumb:hover {
  background-color: var(--text-muted);
}
</style>