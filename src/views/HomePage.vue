<template>
  <div class="bg-gray-900 text-white antialiased">
    <!-- 导航栏 -->
    <nav class="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <i data-lucide="bot" class="h-8 w-8 text-indigo-400"></i>
            </div>
            <div class="hidden md:block">
              <div class="ml-10 flex items-baseline space-x-4">
                <a
                  href="#"
                  @click.prevent="setActivePage('page-chat')"
                  :class="[
                    'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    activePage === 'page-chat'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  ]"
                >
                  角色聊天
                </a>
                <a
                  href="#"
                  @click.prevent="setActivePage('page-cm')"
                  :class="[
                    'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    activePage === 'page-cm'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  ]"
                >
                  角色管理
                </a>
                <a
                  href="#"
                  @click.prevent="setActivePage('page-kb')"
                  :class="[
                    'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    activePage === 'page-kb'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  ]"
                >
                  知识库管理
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主内容区 -->
    <main class="flex-grow overflow-hidden">
      <!-- 角色聊天页面 -->
      <div id="page-chat" v-show="activePage === 'page-chat'" class="h-full">
        <!-- 角色选择界面 -->
        <div
          v-show="!showChatInterface"
          class="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto"
        >
          <div class="max-w-7xl mx-auto">
            <h1 class="text-3xl font-bold mb-2">选择你的聊天伙伴</h1>
            <p class="text-gray-400 mb-6">搜索或选择一个角色，开始一段沉浸式语音对话。</p>

            <!-- 搜索框 -->
            <div class="mb-8">
              <div class="relative">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3">
                  <i data-lucide="search" class="h-5 w-5 text-gray-400"></i>
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
                class="character-card bg-gray-800 rounded-lg overflow-hidden cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg"
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
            <div v-if="loading.characters" class="flex justify-center items-center py-12">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>

            <!-- 空状态 -->
            <div v-if="!loading.characters && filteredCharacters.length === 0" class="text-center py-12">
              <i data-lucide="users" class="h-16 w-16 text-gray-600 mx-auto mb-4"></i>
              <p class="text-gray-400 text-lg">暂无角色</p>
              <p class="text-gray-500 text-sm mt-2">请先创建一些角色</p>
            </div>
          </div>
        </div>

        <!-- 聊天界面 -->
        <div v-show="showChatInterface" class="h-full flex flex-col">
          <!-- 聊天头部 -->
          <div class="flex items-center p-4 border-b border-gray-700 bg-gray-800 flex-shrink-0">
            <button
              @click="backToSelection"
              class="p-2 rounded-full hover:bg-gray-700 transition-colors"
            >
              <i data-lucide="arrow-left" class="h-5 w-5"></i>
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
                  chatStore.isConnected ? 'bg-green-500' : 'bg-gray-500'
                ]"
              ></div>
              <span class="text-sm text-gray-400">
                {{ chatStore.isConnected ? '已连接' : '连接中...' }}
              </span>
            </div>
          </div>

          <!-- 消息区域 -->
          <div
            ref="chatMessagesContainer"
            class="flex-grow p-6 overflow-y-auto space-y-6"
          >
            <!-- 欢迎消息 -->
            <div v-if="selectedCharacter && chatStore.activeConversationMessages.length === 0" class="flex items-start gap-3">
              <img
                :src="selectedCharacter.avatarUrl"
                :alt="selectedCharacter.name"
                class="w-10 h-10 rounded-full"
                @error="handleImageError"
              >
              <div class="bg-gray-700 rounded-lg rounded-tl-none p-4 max-w-lg">
                <p class="text-sm">
                  你好，我是{{ selectedCharacter.name }}。有什么我可以帮助你的吗？让我们开始对话吧。
                </p>
              </div>
            </div>

            <!-- 聊天消息 -->
            <div
              v-for="message in chatStore.activeConversationMessages"
              :key="message.timestamp"
              :class="[
                'flex items-start gap-3',
                message.type === 'user' ? 'justify-end' : ''
              ]"
            >
              <img
                v-if="message.type === 'ai'"
                :src="selectedCharacter?.avatarUrl"
                :alt="selectedCharacter?.name"
                class="w-10 h-10 rounded-full"
                @error="handleImageError"
              >

              <div
                :class="[
                  'rounded-lg p-3 max-w-lg',
                  message.type === 'user'
                    ? 'bg-indigo-600 rounded-br-none text-white'
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

              <img
                v-if="message.type === 'user'"
                src="https://placehold.co/40x40/94a3b8/FFFFFF?text=You"
                alt="You"
                class="w-10 h-10 rounded-full"
              >
            </div>

            <!-- 正在思考指示器 -->
            <div v-if="isAiThinking" class="flex items-start gap-3">
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

          <!-- 输入和控制区域 -->
          <div class="p-6 border-t border-gray-700 bg-gray-800/70 flex-shrink-0">
            <div class="max-w-4xl mx-auto">
              <!-- 状态指示器 -->
              <div class="text-center mb-4">
                <div class="text-sm text-gray-400 h-5">
                  {{ statusText }}
                </div>
              </div>

              <!-- 输入区域 -->
              <div class="flex items-center space-x-4">
                <!-- 文本输入框 -->
                <div class="flex-1">
                  <textarea
                    v-model="messageInput"
                    @keydown.enter.prevent="handleEnterKey"
                    @keydown.shift.enter.prevent="handleShiftEnter"
                    placeholder="输入文字或开始语音..."
                    rows="1"
                    class="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    :disabled="recording.isRecording || chatStore.isConnecting"
                  ></textarea>
                </div>

                <!-- 语音录制按钮 -->
                <button
                  @click="toggleRecording"
                  :disabled="chatStore.isConnecting"
                  :class="[
                    'rounded-full w-14 h-14 flex items-center justify-center transition-all duration-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900',
                    recording.isRecording
                      ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                      : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
                    chatStore.isConnecting ? 'opacity-50 cursor-not-allowed' : ''
                  ]"
                >
                  <i
                    :data-lucide="recording.isRecording ? 'square' : 'mic'"
                    class="h-6 w-6"
                  ></i>
                </button>

                <!-- 发送按钮 -->
                <button
                  @click="sendMessage"
                  :disabled="!messageInput.trim() || chatStore.isConnecting"
                  :class="[
                    'rounded-lg px-6 py-3 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900',
                    messageInput.trim() && !chatStore.isConnecting
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  ]"
                >
                  <i data-lucide="send" class="h-5 w-5"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 角色管理页面 -->
      <div id="page-cm" v-show="activePage === 'page-cm'" class="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
        <CharacterManager
          @character-updated="refreshCharacters"
          @character-created="refreshCharacters"
          @character-deleted="refreshCharacters"
        />
      </div>

      <!-- 知识库管理页面 -->
      <div id="page-kb" v-show="activePage === 'page-kb'" class="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
        <KnowledgeManager />
      </div>
    </main>

    <!-- 全局通知 -->
    <Notification ref="notification" />
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useCharacterStore } from '@/stores/character'
import CharacterManager from '@/components/CharacterManager.vue'
import KnowledgeManager from '@/components/KnowledgeManager.vue'
import Notification from '@/components/Notification.vue'
import { useMicrophoneStreamer } from '@/composables/useMicrophoneStreamer'
import { lucide } from 'lucide-vue-next'

export default {
  name: 'HomePage',
  components: {
    CharacterManager,
    KnowledgeManager,
    Notification
  },
  setup() {
    const chatStore = useChatStore()
    const characterStore = useCharacterStore()

    // 页面状态
    const activePage = ref('page-chat')
    const showChatInterface = ref(false)
    const selectedCharacter = ref(null)
    const searchQuery = ref('')
    const messageInput = ref('')
    const isAiThinking = ref(false)

    // UI元素引用
    const chatMessagesContainer = ref(null)
    const notification = ref(null)

    // 加载状态
    const loading = ref({
      characters: false
    })

    // 录音相关
    const {
      recording,
      startRecording,
      stopRecording,
      initialize: initializeAudio
    } = useMicrophoneStreamer()

    // 状态文本
    const statusText = computed(() => {
      if (chatStore.isConnecting) return '正在连接...'
      if (recording.isRecording) return '正在聆听...'
      if (isAiThinking.value) return 'AI正在思考...'
      if (recording.processing) return '正在处理语音...'
      return '点击下方按钮开始说话'
    })

    // 过滤后的角色列表
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

    // 设置当前页面
    const setActivePage = (pageId) => {
      activePage.value = pageId
    }

    // 选择角色
    const selectCharacter = async (character) => {
      selectedCharacter.value = character
      showChatInterface.value = true

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
        notification.value?.show('连接失败，请重试', 'error')
      }
    }

    // 返回角色选择
    const backToSelection = () => {
      showChatInterface.value = false
      chatStore.disconnect()
      selectedCharacter.value = null
      characterStore.setActiveCharacter(null)
      messageInput.value = ''
    }

    // 发送文本消息
    const sendMessage = async () => {
      const content = messageInput.value.trim()
      if (!content || !chatStore.isConnected) return

      // 添加用户消息
      chatStore.addUserMessage(content, selectedCharacter.value.id)
      messageInput.value = ''
      isAiThinking.value = true

      // 发送到WebSocket
      chatStore.sendMessage(content)

      // 滚动到底部
      await scrollToBottom()
    }

    // 处理Enter键
    const handleEnterKey = () => {
      if (!recording.isRecording) {
        sendMessage()
      }
    }

    // 处理Shift+Enter键
    const handleShiftEnter = () => {
      messageInput.value += '\n'
    }

    // 切换录音状态
    const toggleRecording = async () => {
      if (recording.isRecording) {
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
          notification.value?.show('录音启动失败，请检查麦克风权限', 'error')
        }
      }
    }

    // 滚动到底部
    const scrollToBottom = async () => {
      await nextTick()
      if (chatMessagesContainer.value) {
        chatMessagesContainer.value.scrollTop = chatMessagesContainer.value.scrollHeight
      }
    }

    // 处理图片加载错误
    const handleImageError = (event) => {
      event.target.src = `https://placehold.co/400x400/4b5563/E2E8F0?text=${encodeURIComponent(event.target.alt || 'Avatar')}`
    }

    // 刷新角色列表
    const refreshCharacters = async () => {
      loading.value.characters = true
      try {
        await characterStore.fetchCharacters()
      } catch (error) {
        console.error('获取角色列表失败:', error)
        notification.value?.show('获取角色列表失败', 'error')
      } finally {
        loading.value.characters = false
      }
    }

    // 监听聊天消息变化，自动滚动到底部
    watch(
      () => chatStore.activeConversationMessages,
      async () => {
        await scrollToBottom()
      },
      { deep: true }
    )

    // 监听录音状态变化
    watch(
      () => recording.processing,
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

    onMounted(async () => {
      // 初始化Lucide图标
      nextTick(() => {
        lucide.createIcons()
      })

      // 加载角色列表
      await refreshCharacters()
    })

    return {
      // 页面状态
      activePage,
      showChatInterface,
      selectedCharacter,
      searchQuery,
      messageInput,
      isAiThinking,
      statusText,

      // Store
      chatStore,
      characterStore,

      // UI元素
      chatMessagesContainer,
      notification,

      // 加载状态
      loading,

      // 录音状态
      recording,

      // 计算属性
      filteredCharacters,

      // 方法
      setActivePage,
      selectCharacter,
      backToSelection,
      sendMessage,
      handleEnterKey,
      handleShiftEnter,
      toggleRecording,
      handleImageError,
      refreshCharacters
    }
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 自定义滚动条样式 */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #1f2937;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}

/* 角色卡片悬停效果 */
.character-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.character-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* 动画效果 */
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-bounce {
  animation: bounce 1s infinite;
}
</style>