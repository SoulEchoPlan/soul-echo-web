<template>
  <div class="chat-history" ref="chatHistoryRef">
    <!-- 角色问候信息 -->
    <div v-if="showGreeting" class="greeting-wrapper">
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
        <!-- 为未完成的 AI 消息添加打字光标 -->
        <span v-if="message.type === 'ai' && !message.isComplete" class="typing-cursor"></span>
      </div>
    </div>

    <!-- 连接状态提示 -->
    <div v-if="showConnectionStatus" class="connection-status">
      <span>{{ connectionStatusText }}</span>
      <!-- 重连按钮（仅在真正断开连接时显示） -->
      <button
        v-if="!isConnecting && hasConnectionAttempted && activeCharacter && !isConnected"
        @click="handleReconnect"
        class="reconnect-btn"
      >
        重连
      </button>
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
const hasConnectionAttempted = computed(() => chatStore.hasConnectionAttempted)

const showGreeting = computed(() => {
  return activeCharacter.value && messages.value.length === 0
})

const showConnectionStatus = computed(() => {
  // 正在连接时显示提示
  if (isConnecting.value) return true

  // 只有在已尝试连接、有选中角色、且当前未连接时才显示"断开"提示
  // 这样可以避免初始加载时的误报（Race Condition）
  return hasConnectionAttempted.value && activeCharacter.value && !isConnected.value
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

// 重连处理函数
const handleReconnect = async () => {
  if (activeCharacter.value) {
    try {
      await chatStore.connect(activeCharacter.value)
    } catch (error) {
      console.error('重连失败:', error)
    }
  }
}
</script>

<style scoped>
.chat-history {
  flex-grow: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.greeting-wrapper {
  margin-bottom: 1.5rem;
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.reconnect-btn {
  padding: 0.4rem 1rem;
  background-color: var(--accent-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-style: normal;
  transition: background-color 0.2s, transform 0.1s;
}

.reconnect-btn:hover {
  background-color: var(--accent-color-hover, #45a0f5);
  transform: scale(1.05);
}

.reconnect-btn:active {
  transform: scale(0.98);
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

/* 打字光标动画 */
.typing-cursor {
  display: inline-block;
  width: 2px;
  height: 1em;
  background-color: currentColor;
  margin-left: 2px;
  animation: blink 1s infinite;
  vertical-align: text-bottom;
}

@keyframes blink {
  0%, 49% {
    opacity: 1;
  }
  50%, 100% {
    opacity: 0;
  }
}
</style>