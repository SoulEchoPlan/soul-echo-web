<template>
  <div
    ref="messagesContainer"
    class="flex-grow p-6 overflow-y-auto"
  >
    <!-- 欢迎消息 -->
    <div v-if="messages.length === 0 && selectedCharacter" class="flex items-start gap-3 mb-6">
      <img
        :src="selectedCharacter.avatarUrl"
        :alt="selectedCharacter.name"
        class="w-10 h-10 rounded-full"
        @error="handleImageError"
      >
      <div class="bg-gray-700 rounded-lg rounded-tl-none p-3 max-w-lg">
        <p class="text-sm">
          你好，我是{{ selectedCharacter.name }}。有什么我可以帮助你的吗？让我们开始对话吧。
        </p>
      </div>
    </div>

    <!-- 聊天消息 -->
    <div
      v-for="message in messages"
      :key="message.timestamp"
      :class="[
        'flex items-start gap-3 mb-6',
        message.type === 'user' ? 'justify-end' : ''
      ]"
    >
      <!-- AI头像 -->
      <img
        v-if="message.type === 'ai'"
        :src="selectedCharacter?.avatarUrl"
        :alt="selectedCharacter?.name"
        class="w-10 h-10 rounded-full"
        @error="handleImageError"
      >

      <!-- 消息气泡 -->
      <div
        :class="[
          'rounded-lg p-3 max-w-lg',
          message.type === 'user'
            ? 'bg-indigo-600 rounded-br-none'
            : 'bg-gray-700 rounded-tl-none'
        ]"
      >
        <p class="text-sm whitespace-pre-wrap">{{ message.content }}</p>
        <!-- 打字光标动画 -->
        <span
          v-if="message.type === 'ai' && !message.isComplete"
          class="inline-block w-2 h-4 bg-gray-400 animate-pulse ml-1"
        ></span>
      </div>

      <!-- 用户头像 -->
      <img
        v-if="message.type === 'user'"
        src="https://placehold.co/40x40/94a3b8/FFFFFF?text=You"
        alt="You"
        class="w-10 h-10 rounded-full"
      >
    </div>

    <!-- 正在思考指示器 -->
    <div v-if="isAiThinking" class="flex items-start gap-3 mb-6">
      <img
        v-if="selectedCharacter"
        :src="selectedCharacter.avatarUrl"
        :alt="selectedCharacter.name"
        class="w-10 h-10 rounded-full"
        @error="handleImageError"
      >
      <div class="bg-gray-700 rounded-lg rounded-tl-none p-4">
        <div class="flex space-x-1">
          <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
          <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  },
  selectedCharacter: {
    type: Object,
    default: null
  },
  isAiThinking: {
    type: Boolean,
    default: false
  }
})

const messagesContainer = ref(null)

// 滚动到底部
const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 处理图片加载错误
const handleImageError = (event) => {
  event.target.src = `https://placehold.co/40x40/4b5563/E2E8F0?text=${encodeURIComponent(event.target.alt || 'Avatar')}`
}

// 监听消息变化，自动滚动到底部
watch(
  () => props.messages,
  async () => {
    await scrollToBottom()
  },
  { deep: true, immediate: true }
)

// 监听AI思考状态变化
watch(
  () => props.isAiThinking,
  async () => {
    await scrollToBottom()
  }
)
</script>

