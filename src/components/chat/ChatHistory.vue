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

    <!-- 连接状态提示（仅在断开连接时显示） -->
    <div v-if="showConnectionStatus" class="connection-status">
      <span>{{ connectionStatusText }}</span>
      <!-- 重连按钮 -->
      <button
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
  // 只在真正断开连接时显示提示（移除"正在连接"状态）
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
  // 只在断开连接时返回提示文本
  if (!isConnected.value && activeCharacter.value && !isConnecting.value) {
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
  padding: 1rem;
  border-radius: 8px;
  line-height: 1.6;
  font-size: 1rem;
  width: fit-content;
  max-width: 50%;
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
  line-height: 1.8; /* 黄金阅读行高 */
  width: fit-content;
  max-width: 80%;
  font-size: 1rem; /* 默认字号 */
  text-align: justify; /* 两端对齐，增加整洁度 */
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

/* Markdown 渲染样式 - 精排版电子书风格 */

/* 段落优化 - 增加呼吸感 */
.message.ai .message-content :deep(p) {
  margin-bottom: 1em; /* 增加段落间距，营造阅读小说的沉浸感 */
}

.message.ai .message-content :deep(p:first-child) {
  margin-top: 0;
}

.message.ai .message-content :deep(p:last-child) {
  margin-bottom: 0;
}

/* 强制修复粗体 - 确保清晰可见，颜色自动适配主题 */
.message.ai .message-content :deep(strong),
.message.ai .message-content :deep(b) {
  font-weight: 700 !important; /* 只保留加粗，颜色继承父元素自动适配主题 */
}

/* 优化斜体/动作描写 - 保留倾斜并增强视觉区分 */
.message.ai .message-content :deep(em),
.message.ai .message-content :deep(i) {
  font-style: italic; /* 恢复倾斜样式 */
  color: #6b7280; /* 使用灰色表示动作/旁白，与对话内容区分 */
  font-family: "KaiTi", "STKaiti", "楷体", serif; /* 使用楷体/衬线体营造小说旁白感 */
  padding: 0 4px; /* 增加微小间距，视觉上更舒适 */
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

/* 列表优化 - 增加缩进和间距 */
.message.ai .message-content :deep(ul),
.message.ai .message-content :deep(ol) {
  margin: 0.75em 0; /* 增加上下边距 */
  padding-left: 1.5em; /* 保持左侧缩进 */
}

.message.ai .message-content :deep(li) {
  margin-bottom: 0.5em; /* 增加列表项间距 */
}

.message.ai .message-content :deep(li:last-child) {
  margin-bottom: 0;
}

/* 引用块优化 - 增加视觉区分 */
.message.ai .message-content :deep(blockquote) {
  margin: 1em 0;
  padding: 0.5em 1em;
  border-left: 4px solid var(--accent-color, #4a90e2); /* 左侧彩色边框 */
  background-color: rgba(0, 0, 0, 0.03); /* 轻微变灰的背景 */
  color: #6b7280; /* 引用内容使用灰色 */
}

.message.ai .message-content :deep(blockquote p) {
  margin-bottom: 0; /* 引用内的段落不需要额外间距 */
}

.message.ai .message-content :deep(a) {
  color: var(--accent-color);
  text-decoration: underline;
}

.message.ai .message-content :deep(a:hover) {
  color: var(--accent-hover);
}
</style>