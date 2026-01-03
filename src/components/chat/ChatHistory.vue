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
        <!-- AI 消息使用 Markdown 渲染，用户消息直接显示 -->
        <template v-if="message.type === 'ai'">
          <span v-html="renderMarkdown(message.content)"></span>
        </template>
        <span v-else>{{ message.content }}</span>
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
import MarkdownIt from 'markdown-it'

// 初始化 Markdown 渲染器
const md = new MarkdownIt({
  html: false,        // 禁用 HTML 标签
  linkify: true,      // 自动转换 URL 为链接
  typographer: true   // 启用一些语言中立的替换和引号美化
})

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

  // 只有在已尝试连接、有选中角色、当前未连接且未在连接中时才显示"断开"提示
  // 避免切换角色时的误报：确保连接状态稳定后再显示
  return hasConnectionAttempted.value &&
         activeCharacter.value &&
         !isConnected.value &&
         !isConnecting.value
})

// 检测内容是否包含块级 Markdown 语法
const hasBlockMarkdown = (content) => {
  const blockPatterns = [
    /^#+\s/m,           // 标题
    /^[\s]*[-*+]\s/m,   // 无序列表
    /^\d+\.\s/m,        // 有序列表
    /^```/m,            // 代码块
    /^>\s/m,            // 引用
    /^[-*_]{3,}/m       // 分隔线
  ]
  return blockPatterns.some(pattern => pattern.test(content))
}

// 渲染 Markdown 内容（根据内容智能选择渲染方式）
const renderMarkdown = (content) => {
  if (!content) return ''
  // 根据是否包含块级语法选择渲染方式
  // - 包含块级语法：使用 md.render() 支持复杂 Markdown
  // - 不包含块级语法：使用 md.renderInline() 保持光标位置正确
  return hasBlockMarkdown(content)
    ? md.render(content)
    : md.renderInline(content)
}

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

/* Markdown 渲染样式 */
.message.ai .message-content :deep(p) {
  margin: 0.5em 0;
}

.message.ai .message-content :deep(p:first-child) {
  margin-top: 0;
}

.message.ai .message-content :deep(p:last-child) {
  margin-bottom: 0;
}

.message.ai .message-content :deep(code) {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.9em;
}

.message.ai .message-content :deep(pre) {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 1em;
  border-radius: 6px;
  overflow-x: auto;
  margin: 0.5em 0;
}

.message.ai .message-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
  font-size: 0.9em;
}

.message.ai .message-content :deep(ul),
.message.ai .message-content :deep(ol) {
  margin: 0.5em 0;
  padding-left: 1.5em;
}

.message.ai .message-content :deep(li) {
  margin: 0.25em 0;
}

.message.ai .message-content :deep(strong) {
  font-weight: 600;
}

.message.ai .message-content :deep(em) {
  font-style: italic;
}

.message.ai .message-content :deep(a) {
  color: var(--accent-color);
  text-decoration: underline;
}

.message.ai .message-content :deep(a:hover) {
  color: var(--accent-hover);
}
</style>