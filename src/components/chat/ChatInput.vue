<template>
  <div class="user-input-area" :class="{ disabled: !chatStore.isConnected }">
    <button
        class="action-btn mic-btn"
        :class="{ recording: isRecording }"
        @click="handleMicClick"
        :aria-label="isRecording ? '停止录音' : '录音'"
        :disabled="!chatStore.isConnected"
    >
      <i :data-feather="isRecording ? 'stop-circle' : 'mic'"></i>
    </button>
    <label>
      <textarea
          class="input-field"
          :placeholder="inputPlaceholder"
          rows="1"
          v-model="messageText"
          @keydown="handleKeydown"
          ref="textareaRef"
          :disabled="!chatStore.isConnected"
      ></textarea>
    </label>
    <button
        class="action-btn send-btn"
        @click="handleSend"
        aria-label="发送"
        :disabled="!chatStore.isConnected || !messageText.trim()"
    >
      <i data-feather="send"></i>
    </button>
  </div>
</template>

<script setup>
import {ref, computed, nextTick, onMounted, onUnmounted} from 'vue'
import {useChatStore} from '@/stores/chat'
import {useCharacterStore} from '@/stores/character'
import {ModernMicrophoneStreamer} from '@/utils/ModernMicrophoneStreamer'
import feather from 'feather-icons'

// 定义 props
const props = defineProps({
  ttsEnabled: {
    type: Boolean,
    default: false
  }
})

const chatStore = useChatStore()
const characterStore = useCharacterStore()

const messageText = ref('')
const isRecording = ref(false)
const textareaRef = ref(null)

// 动态占位符：根据连接状态显示不同提示
const inputPlaceholder = computed(() => {
  if (!chatStore.isConnected) {
    return '正在连接角色...'
  }
  return '输入或用语音命名...'
})

// 使用现代 AudioWorklet 的麦克风录音器
const microphoneStreamer = new ModernMicrophoneStreamer()

// 设置音频数据处理回调
let audioPacketCount = 0
microphoneStreamer.onAudioData((pcmData) => {
  audioPacketCount++
  if (audioPacketCount % 100 === 0) {
    console.log(`[ChatInput] 发送音频数据包 #${audioPacketCount}, 大小: ${pcmData.byteLength} bytes`)
  }
  chatStore.sendAudioData(pcmData)
})

const handleMicClick = async () => {
  console.log('[ChatInput] 麦克风按钮点击，当前录音状态:', isRecording.value)

  // 首次点击录音时，初始化音频播放器（满足浏览器安全策略）
  if (!isRecording.value) {
    try {
      chatStore.audioPlayer.initialize()
      console.log('[ChatInput] 音频播放器初始化成功')
    } catch (error) {
      console.error('[ChatInput] 音频播放器初始化失败:', error)
    }

    // 关键修复：在开始录音前先发送TTS状态更新消息
    const ttsUpdateSuccess = chatStore.updateTtsState(props.ttsEnabled)
    if (ttsUpdateSuccess) {
      console.log('[ChatInput] TTS状态已更新到后端:', props.ttsEnabled)
    } else {
      console.warn('[ChatInput] TTS状态更新失败，但继续录音流程')
    }
  }

  if (isRecording.value) {
    console.log('[ChatInput] 停止录音')
    microphoneStreamer.stop()
  } else {
    console.log('[ChatInput] 开始录音')
    await microphoneStreamer.start()
  }

  // 同步 UI 状态
  isRecording.value = microphoneStreamer.isRecording
  console.log('[ChatInput] UI状态已同步，isRecording:', isRecording.value)
  updateMicButtonUI()
}

const updateMicButtonUI = () => {
  nextTick(() => {
    feather.replace()
  })
}

const handleSend = () => {
  sendTextMessage()
}

const handleKeydown = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendTextMessage()
  }
}

const sendTextMessage = () => {
  const text = messageText.value.trim()
  if (!text || !characterStore.activeCharacterId) {
    return
  }

  // 初始化音频播放器（满足浏览器自动播放策略）
  try {
    chatStore.audioPlayer.initialize()
    console.log('音频播放器已初始化（发送消息时）')
  } catch (error) {
    console.error('音频播放器初始化失败:', error)
  }

  // 添加用户消息到聊天记录
  chatStore.addUserMessage(text, characterStore.activeCharacterId)

  // 清空输入框
  messageText.value = ''
  adjustTextareaHeight()

  // 发送消息，传递 TTS 配置
  const success = chatStore.sendMessage(text, { ttsEnabled: props.ttsEnabled })
  if (!success) {
    chatStore.addErrorMessage('连接已断开，请刷新页面或重新选择角色', characterStore.activeCharacterId)
  }
}

const adjustTextareaHeight = () => {
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = '50px'
      const scrollHeight = textareaRef.value.scrollHeight
      if (scrollHeight > 50) {
        textareaRef.value.style.height = Math.min(scrollHeight, 120) + 'px'
      }
    }
  })
}

onMounted(() => {
  feather.replace()

  // 监听输入变化，自动调整文本框高度
  if (textareaRef.value) {
    textareaRef.value.addEventListener('input', adjustTextareaHeight)
  }
})

onUnmounted(() => {
  microphoneStreamer.destroy()
})
</script>

<style scoped>
.user-input-area {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
  flex-shrink: 0;
  transition: opacity 0.3s ease;
}

/* 禁用状态：降低透明度，给用户明确的视觉暗示 */
.user-input-area.disabled {
  opacity: 0.6;
}

.user-input-area label {
  flex-grow: 1;
  margin: 0 1rem;
}

.user-input-area .input-field {
  width: 100%;
  background-color: var(--secondary-bg);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  resize: none;
  height: 50px;
  border: 1px solid transparent;
  min-height: 50px;
  max-height: 120px;
  overflow-y: auto;
}

/* 禁用状态的输入框样式 */
.user-input-area .input-field:disabled {
  cursor: not-allowed;
}

.user-input-area .action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: var(--secondary-bg);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

/* 禁用状态的按钮样式 */
.user-input-area .action-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.user-input-area .action-btn:hover:not(:disabled) {
  background-color: var(--border-color);
}

.user-input-area .send-btn {
  background-color: var(--accent-color);
  color: white;
}

.user-input-area .send-btn:hover:not(:disabled) {
  background-color: var(--accent-hover);
}

.user-input-area .mic-btn.recording {
  background-color: #dc3545;
  color: white;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}
</style>