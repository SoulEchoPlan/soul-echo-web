import { defineStore } from 'pinia'
import { websocketService } from '@/services/websocket'
import { useCharacterStore } from './character'
import AudioStreamPlayer from '@/services/AudioStreamPlayer'

export const useChatStore = defineStore('chat', {
  state: () => ({
    conversations: {}, // 按角色ID存储对话历史
    isConnected: false,
    isConnecting: false,
    audioPlayer: new AudioStreamPlayer()
  }),

  getters: {
    activeConversationMessages: (state) => {
      const characterStore = useCharacterStore()
      const activeId = characterStore.activeCharacterId
      return state.conversations[activeId] || []
    }
  },

  actions: {
    async connect(character) {
      if (!character) {
        console.error('无效的角色数据')
        return
      }

      this.isConnecting = true
      try {
        await websocketService.connect(character)
        this.isConnected = true
        console.log(`WebSocket连接已建立，角色ID: ${character.id}`)

        // 绑定消息处理器
        websocketService.onMessage((event) => {
          this.handleIncomingMessage(event, character.id)
        })

        // 绑定连接状态处理器
        websocketService.onConnectionChange((isConnected) => {
          this.isConnected = isConnected
        })

        // 绑定错误处理器
        websocketService.onError((error) => {
          console.error('WebSocket store error:', error)
          this.addErrorMessage('连接出现错误', character.id)
        })

      } catch (error) {
        console.error('WebSocket连接失败:', error)
        this.isConnected = false
        throw error
      } finally {
        this.isConnecting = false
      }
    },

    disconnect() {
      websocketService.disconnect()
      this.isConnected = false
    },

    sendMessage(message) {
      if (!this.isConnected) {
        console.warn('WebSocket未连接，无法发送消息')
        return false
      }

      try {
        websocketService.send(message)
        return true
      } catch (error) {
        console.error('发送消息失败:', error)
        return false
      }
    },

    addMessage(message, characterId) {
      if (!this.conversations[characterId]) {
        this.conversations[characterId] = []
      }
      // 确保消息对象包含 isComplete 属性（默认为 true）
      const messageWithComplete = {
        ...message,
        isComplete: message.isComplete !== undefined ? message.isComplete : true
      }
      this.conversations[characterId].push(messageWithComplete)
    },

    addUserMessage(content, characterId) {
      this.addMessage({
        type: 'user',
        content,
        timestamp: new Date().toISOString()
      }, characterId)
    },

    addAiMessage(content, characterId, audioUrl = null, isComplete = true) {
      this.addMessage({
        type: 'ai',
        content,
        audioUrl,
        isComplete,
        timestamp: new Date().toISOString()
      }, characterId)
    },

    addErrorMessage(content, characterId) {
      this.addMessage({
        type: 'error',
        content,
        timestamp: new Date().toISOString()
      }, characterId)
    },

    clearMessages(characterId) {
      if (characterId && this.conversations[characterId]) {
        this.conversations[characterId] = []
      }
    },

    // 处理接收到的WebSocket消息
    handleIncomingMessage(event, characterId) {
      if (event.data instanceof ArrayBuffer) {
        // 处理二进制音频数据 - 使用流式播放器
        console.log('收到音频数据块:', event.data.byteLength, 'bytes')
        this.audioPlayer.receive(event.data)
        return
      }

      // 处理文本消息
      const textData = typeof event.data === 'string' ? event.data : event.data.toString()

      // 尝试解析为 JSON（用于用户语音回显）
      try {
        const jsonData = JSON.parse(textData)

        if (jsonData.type === 'user-transcription') {
          // 用户语音识别结果回显
          console.log('收到用户语音识别:', jsonData.content)
          this.addUserMessage(jsonData.content, characterId)
          return
        }
      } catch (e) {
        // 不是 JSON，继续作为流式文本处理
      }

      // 处理流式文本
      const textChunk = textData

      // 检查是否是流结束信号
      if (textChunk === '[STREAM_END]') {
        console.log('收到流结束信号')
        const messages = this.conversations[characterId]
        if (messages && messages.length > 0) {
          const lastMessage = messages[messages.length - 1]
          if (lastMessage.type === 'ai' && !lastMessage.isComplete) {
            lastMessage.isComplete = true
            console.log('AI消息流完成')
          }
        }
        return
      }

      // 查找当前角色的对话历史中最后一条消息
      const messages = this.conversations[characterId] || []
      const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null

      if (lastMessage && lastMessage.type === 'ai' && !lastMessage.isComplete) {
        // 追加到现有的未完成消息
        lastMessage.content += textChunk
        console.log('追加文本块:', textChunk)
      } else {
        // 创建新的未完成 AI 消息
        console.log('创建新的流式消息:', textChunk)
        this.addAiMessage(textChunk, characterId, null, false)
      }
    }
  }
})