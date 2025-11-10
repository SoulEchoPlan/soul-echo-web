<template>
  <div class="h-full">
    <!-- 角色选择界面 -->
    <div id="character-selection" v-show="!showChat" class="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-3xl font-bold mb-2">选择你的聊天伙伴</h1>
        <p class="text-gray-400 mb-6">搜索或选择一个角色，开始一段沉浸式语音对话。</p>

        <!-- 搜索框 -->
        <div class="mb-8">
          <div class="relative">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search class="h-5 w-5 text-gray-400" />
            </span>
            <input
              v-model="searchQuery"
              type="search"
              placeholder="搜索角色，例如：哈利波特"
              class="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
          </div>
        </div>

        <!-- 角色卡片列表 -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div
            v-for="character in filteredCharacters"
            :key="character.id"
            @click="selectCharacter(character)"
            class="character-card bg-gray-800 rounded-lg overflow-hidden cursor-pointer"
          >
            <img
              :src="character.avatarUrl"
              :alt="character.name"
              class="w-full h-48 object-cover"
              @error="handleImageError"
            >
            <div class="p-4">
              <h3 class="text-lg font-semibold">{{ character.name }}</h3>
              <p class="text-sm text-gray-400 mt-1 line-clamp-2">{{ character.personaPrompt }}</p>
            </div>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>

        <!-- 空状态 -->
        <div v-if="!loading && filteredCharacters.length === 0" class="text-center py-12">
          <Users class="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <p class="text-gray-400 text-lg">暂无角色</p>
          <p class="text-gray-500 text-sm mt-2">请先创建一些角色</p>
        </div>
      </div>
    </div>

    <!-- 聊天界面 -->
    <div id="chat-interface" v-show="showChat" class="h-full flex flex-col">
      <!-- 聊天头部 -->
      <div class="flex items-center p-4 border-b border-gray-700 bg-gray-800 flex-shrink-0">
        <button
          @click="backToSelection"
          class="p-2 rounded-full hover:bg-gray-700"
        >
          <ArrowLeft class="h-5 w-5" />
        </button>
        <img
          v-if="selectedCharacter"
          :src="selectedCharacter.avatarUrl"
          :alt="selectedCharacter.name"
          class="w-10 h-10 rounded-full ml-4"
          @error="handleImageError"
        >
        <h2 v-if="selectedCharacter" class="text-lg font-semibold ml-3">
          {{ selectedCharacter.name }}
        </h2>
        <div class="ml-auto flex items-center space-x-2">
          <div
            :class="[
              'w-2 h-2 rounded-full',
              isConnected ? 'bg-green-500' : 'bg-gray-500'
            ]"
          ></div>
          <span class="text-sm text-gray-400">
            {{ isConnected ? '已连接' : '连接中...' }}
          </span>
        </div>
      </div>

      <!-- 消息区域 -->
      <ChatHistory
        :messages="messages"
        :selected-character="selectedCharacter"
        :is-ai-thinking="isAiThinking"
      />

      <!-- 输入和控制区域 -->
      <ChatInput
        :is-recording="isRecording"
        :is-connecting="isConnecting"
        :is-ai-thinking="isAiThinking"
        :is-processing="isProcessing"
        :disabled="isConnecting || !isConnected"
        @toggle-recording="toggleRecording"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useCharacterStore } from '@/stores/character'
import { useMicrophoneStreamer } from '@/composables/useMicrophoneStreamer'
import ChatHistory from './ChatHistory.vue'
import ChatInput from './ChatInput.vue'
import {
  Search,
  Users,
  ArrowLeft
} from 'lucide-vue-next'

const chatStore = useChatStore()
const characterStore = useCharacterStore()

// 录音相关
const {
  recording,
  startRecording,
  stopRecording,
  initialize: initializeAudio
} = useMicrophoneStreamer()

// 状态
const showChat = ref(false)
const selectedCharacter = ref(null)
const searchQuery = ref('')
const isAiThinking = ref(false)
const loading = ref(false)

// 计算属性
const filteredCharacters = computed(() => {
  if (!searchQuery.value.trim()) {
    return characterStore.characters
  }
  const query = searchQuery.value.toLowerCase()
  return characterStore.characters.filter(character =>
    character.name.toLowerCase().includes(query) ||
    character.personaPrompt.toLowerCase().includes(query)
  )
})

const messages = computed(() => chatStore.activeConversationMessages)
const isConnected = computed(() => chatStore.isConnected)
const isConnecting = computed(() => chatStore.isConnecting)
const isRecording = computed(() => recording.value.isRecording)
const isProcessing = computed(() => recording.value.processing)

// 选择角色
const selectCharacter = async (character) => {
  selectedCharacter.value = character
  showChat.value = true

  // 初始化音频
  try {
    await initializeAudio()
    chatStore.audioPlayer.initialize()
  } catch (error) {
    console.error('音频初始化失败:', error)
  }

  // 建立WebSocket连接
  try {
    await chatStore.connect(character)
    characterStore.setActiveCharacter(character.id)
  } catch (error) {
    console.error('连接失败:', error)
  }
}

// 返回角色选择
const backToSelection = () => {
  showChat.value = false
  chatStore.disconnect()
  selectedCharacter.value = null
  characterStore.setActiveCharacter(null)
}

// 切换录音状态
const toggleRecording = async () => {
  if (recording.value.isRecording) {
    stopRecording()
  } else {
    try {
      // 确保音频已初始化
      await initializeAudio()
      chatStore.audioPlayer.initialize()

      // 开始录音
      await startRecording((audioData) => {
        if (chatStore.isConnected) {
          chatStore.sendMessage(audioData)
        }
      })
    } catch (error) {
      console.error('录音启动失败:', error)
    }
  }
}

// 处理图片加载错误
const handleImageError = (event) => {
  event.target.src = `https://placehold.co/400x400/4b5563/E2E8F0?text=${encodeURIComponent(event.target.alt || 'Avatar')}`
}

// 监听录音状态变化
watch(
  () => recording.value.processing,
  (processing) => {
    if (!processing) {
      isAiThinking.value = true
    }
  }
)

// 监听AI消息完成
watch(
  () => chatStore.activeConversationMessages,
  (messages) => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage && lastMessage.type === 'ai' && lastMessage.isComplete) {
      isAiThinking.value = false
    }
  },
  { deep: true }
)

// 暴露方法给父组件
defineExpose({
  backToSelection
})
</script>

