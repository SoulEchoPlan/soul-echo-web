<template>
  <div id="chat-interface" class="h-full flex flex-col">
    <!-- 聊天头部 -->
    <div class="flex items-center p-4 border-b border-gray-700 bg-gray-800 flex-shrink-0">
      <button
        @click="handleBackToSelection"
        class="p-2 rounded-full hover:bg-gray-700"
      >
        <ArrowLeft class="h-5 w-5" />
      </button>
      <img
        v-if="character"
        :src="character.avatarUrl"
        :alt="character.name"
        class="w-10 h-10 rounded-full ml-4"
        @error="handleImageError"
      >
      <h2 v-if="character" class="text-lg font-semibold ml-3">
        {{ character.name }}
      </h2>
    </div>

    <!-- 消息区域 -->
    <div ref="chatMessagesRef" class="flex-grow p-6 overflow-y-auto">
      <!-- 欢迎消息 -->
      <div v-if="messages.length === 0" class="flex items-start gap-3 mb-6">
        <img
          v-if="character"
          :src="character.avatarUrl"
          :alt="character.name"
          class="w-10 h-10 rounded-full"
          @error="handleImageError"
        >
        <div class="bg-gray-700 rounded-lg rounded-tl-none p-3 max-w-lg">
          <p class="text-sm">
            你好，我是{{ character?.name }}。有什么我可以帮助你的吗？让我们开始对话吧。
          </p>
        </div>
      </div>

      <!-- 聊天消息 -->
      <div
        v-for="message in messages"
        :key="message.id"
        :class="[
          'flex items-start gap-3 mb-6',
          message.type === 'user' ? 'justify-end' : ''
        ]"
      >
        <!-- AI头像 -->
        <img
          v-if="message.type === 'ai' && character"
          :src="character.avatarUrl"
          :alt="character.name"
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
        </div>

        <!-- 用户头像 -->
        <img
          v-if="message.type === 'user'"
          src="https://placehold.co/40x40/94a3b8/FFFFFF?text=You"
          alt="You"
          class="w-10 h-10 rounded-full"
        >
      </div>
    </div>

    <!-- 输入和控制区域 -->
    <div class="p-6 border-t border-gray-700 bg-gray-800/70 flex-shrink-0">
      <div class="flex flex-col items-center">
        <div id="status-indicator" class="text-sm text-gray-400 h-5 mb-3">
          {{ statusText }}
        </div>
        <button
          @click="handleToggleRecording"
          :class="[
            'rounded-full w-16 h-16 flex items-center justify-center transition-all duration-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900',
            isRecording
              ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
              : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
          ]"
        >
          <Square v-if="isRecording" class="h-7 w-7 text-white" />
          <Mic v-else class="h-8 w-8 text-white" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { ArrowLeft, Mic, Square } from 'lucide-vue-next'
import { useChatStore } from '@/stores/chat'
import { useMicrophoneStreamer } from '@/composables/useMicrophoneStreamer'
import { handleAudioError, showNotification, devLog } from '@/utils/errorHandler'
import { validateCharacter } from '@/utils/validators'
import config from '@/config'

// 定义 props 和 emits
const props = defineProps({
  character: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['back-to-selection'])

// 响应式数据
const chatMessagesRef = ref(null)

// Store 状态
const chatStore = useChatStore()

// 录音功能
const { recording, isSupported, toggleRecording, checkSupport } = useMicrophoneStreamer()

// 计算属性
const messages = computed(() => {
  const characterId = props.character?.id
  return chatStore.activeConversationMessages.filter(msg =>
    // 确保消息属于当前角色
    msg.characterId === characterId || !msg.characterId
  )
})

const statusText = computed(() => {
  if (recording.value.isRecording) return '正在聆听...'
  if (chatStore.isConnecting) return '正在连接...'
  if (!chatStore.isConnected) return '连接断开，点击重试'
  return '点击下方按钮开始说话'
})

const isRecording = computed(() => recording.value.isRecording)

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (chatMessagesRef.value) {
      chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
    }
  })
}

// 切换录音状态
const handleToggleRecording = async () => {
  if (!isSupported.value) {
    showNotification('浏览器不支持录音功能', 'error')
    return
  }

  try {
    // 确保 WebSocket 连接
    if (!chatStore.isConnected) {
      try {
        await chatStore.connect(props.character)
      } catch (error) {
        devLog('WebSocket连接失败，无法开始录音', 'Error')
        return
      }
    }

    // 初始化音频播放器（需要用户交互）
    if (chatStore.audioPlayer && !chatStore.audioPlayer.initialized) {
      try {
        await chatStore.audioPlayer.initialize()
        devLog('音频播放器初始化成功')
      } catch (error) {
        handleAudioError(error, '音频播放器初始化失败')
      }
    }

    // 开始/停止录音
    await toggleRecording(
      // 音频数据回调
      (audioData) => {
        try {
          if (chatStore.isConnected) {
            chatStore.sendMessage(audioData)
          }
        } catch (error) {
          devLog('发送音频数据失败', 'Error')
        }
      },
      // 选项
      {
        character: props.character,
        autoSend: false, // 我们手动发送，因为需要通过 chatStore
        websocketService: null
      }
    )

  } catch (error) {
    handleAudioError(error, '录音操作失败')
  }
}

// 处理返回按钮点击
const handleBackToSelection = () => {
  chatStore.disconnect()
  emit('back-to-selection')
}

// 处理图片加载错误
const handleImageError = (event) => {
  const name = event.target.alt || 'Avatar'
  event.target.src = `https://placehold.co/40x40/4b5563/E2E8F0?text=${encodeURIComponent(name)}`
}

// 监听角色变化
watch(() => props.character, async (newCharacter) => {
  if (newCharacter) {
    try {
      await chatStore.connect(newCharacter)
      devLog(`已连接到角色: ${newCharacter.name}`)
    } catch (error) {
      devLog('连接角色失败', 'Error')
    }
  }
}, { immediate: true })

// 监听消息变化，自动滚动到底部
watch(messages, () => {
  scrollToBottom()
}, { deep: true })

// 组件挂载时的初始化
onMounted(async () => {
  // 检查录音支持
  checkSupport()

  if (props.character) {
    try {
      await chatStore.connect(props.character)
    } catch (error) {
      devLog('组件挂载时连接失败', 'Error')
    }
  }
})

// 组件卸载时清理
onUnmounted(() => {
  chatStore.disconnect()
})
</script>