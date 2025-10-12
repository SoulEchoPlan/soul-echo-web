<template>
  <div class="user-input-area">
    <button
      class="action-btn mic-btn"
      :class="{ recording: isRecording }"
      @click="handleMicClick"
      :aria-label="isRecording ? '停止录音' : '录音'"
    >
      <i :data-feather="isRecording ? 'stop-circle' : 'mic'"></i>
    </button>
    <label>
      <textarea
        class="input-field"
        placeholder="输入或用语音命名..."
        rows="1"
        v-model="messageText"
        @keydown="handleKeydown"
        ref="textareaRef"
      ></textarea>
    </label>
    <button
      class="action-btn send-btn"
      @click="handleSend"
      aria-label="发送"
    >
      <i data-feather="send"></i>
    </button>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useCharacterStore } from '@/stores/character'
import feather from 'feather-icons'

const chatStore = useChatStore()
const characterStore = useCharacterStore()

const messageText = ref('')
const isRecording = ref(false)
const textareaRef = ref(null)

// 麦克风录音器
class MicrophoneStreamer {
  constructor() {
    this.mediaRecorder = null
    this.isRecording = false
    this.audioStream = null
    this.hasPermission = false
  }

  async initializeStream() {
    if (this.audioStream && this.audioStream.active) {
      return this.audioStream
    }

    try {
      this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      this.hasPermission = true
      return this.audioStream
    } catch (error) {
      this.hasPermission = false
      throw error
    }
  }

  async start() {
    if (this.isRecording) {
      return
    }

    try {
      const stream = await this.initializeStream()
      this.mediaRecorder = new MediaRecorder(stream)

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          // 通过chat store发送音频数据
          if (chatStore.isConnected) {
            chatStore.sendMessage(event.data)
          } else {
            console.warn('WebSocket未连接，无法发送音频数据')
          }
        }
      }

      this.mediaRecorder.start(250)
      this.isRecording = true
    } catch (error) {
      alert('无法获取麦克风权限，请检查浏览器设置并重试。')
      console.error('麦克风权限请求失败:', error)
    }
  }

  stop() {
    if (!this.isRecording) {
      return
    }

    if (this.mediaRecorder) {
      this.mediaRecorder.stop()
    }
    this.isRecording = false
  }

  destroy() {
    this.stop()
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop())
      this.audioStream = null
    }
    this.hasPermission = false
  }
}

const microphoneStreamer = new MicrophoneStreamer()

const handleMicClick = async () => {
  // 首次点击录音时，初始化音频播放器（满足浏览器安全策略）
  if (!isRecording.value) {
    try {
      chatStore.audioPlayer.initialize()
    } catch (error) {
      console.error('音频播放器初始化失败:', error)
    }
  }

  if (isRecording.value) {
    microphoneStreamer.stop()
  } else {
    await microphoneStreamer.start()
  }

  // 同步 UI 状态
  isRecording.value = microphoneStreamer.isRecording
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

  // 添加用户消息到聊天记录
  chatStore.addUserMessage(text, characterStore.activeCharacterId)

  // 清空输入框
  messageText.value = ''
  adjustTextareaHeight()

  // 发送消息
  const success = chatStore.sendMessage(text)
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

.user-input-area .action-btn:hover {
  background-color: var(--border-color);
}

.user-input-area .send-btn {
  background-color: var(--accent-color);
  color: white;
}

.user-input-area .send-btn:hover {
  background-color: var(--accent-hover);
}

.user-input-area .mic-btn.recording {
  background-color: #dc3545;
  color: white;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
</style>