import { defineStore } from 'pinia'
import { websocketService } from '@/services/websocket'
import { useCharacterStore } from './character'
import AudioStreamPlayer from '@/services/AudioStreamPlayer'
import { MessageTypes } from '@/constants/messageTypes'

export const useChatStore = defineStore('chat', {
  state: () => ({
    conversations: {}, // 按角色ID存储对话历史
    isConnected: false,
    isConnecting: false,
    hasConnectionAttempted: false, // 标记是否尝试过连接（用于判断是否显示断开提示）
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
      // 标记已尝试连接，避免初始加载时的误报
      this.hasConnectionAttempted = true

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

    sendMessage(message, options = {}) {
      if (!this.isConnected) {
        console.warn('WebSocket未连接，无法发送消息')
        return false
      }

      try {
        // 构建消息 payload，支持 TTS 等配置参数
        const payload = {
          message: message,
          ttsEnabled: options.ttsEnabled || false
        }

        // 发送序列化后的 JSON 字符串
        websocketService.send(JSON.stringify(payload))
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

      // 安全兜底机制：在添加新消息前，检查并关闭上一条未完成的 AI 消息
      const messages = this.conversations[characterId]
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1]
        // 如果最后一条是未完成的 AI 消息，强制标记为完成
        if (lastMessage.type === 'ai' && !lastMessage.isComplete) {
          messages[messages.length - 1] = {
            ...lastMessage,
            isComplete: true
          }
          console.log('自动关闭上一条未完成的 AI 消息（安全兜底）')
        }
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

      // 尝试解析为 JSON（用于用户语音回显、错误消息、音频信息等）
      try {
        const jsonData = JSON.parse(textData)

        // 用户语音识别结果回显
        if (jsonData.type === MessageTypes.USER_TRANSCRIPTION) {
          console.log('收到用户语音识别:', jsonData.content)
          this.addUserMessage(jsonData.content, characterId)
          return
        }

        // 处理结构化错误消息
        if (jsonData.type === MessageTypes.ERROR) {
          console.error('收到错误消息:', jsonData.content)
          this.addErrorMessage(jsonData.content || '发生未知错误', characterId)
          return
        }

        // 处理音频信息（如有需要）
        if (jsonData.type === MessageTypes.AUDIO_INFO) {
          console.log('收到音频信息:', jsonData)
          // 可以在这里处理音频元数据
          return
        }

        // 处理 AI 回复（如果后端发送 ai-reply 类型的 JSON）
        if (jsonData.type === MessageTypes.AI_REPLY) {
          console.log('收到 AI 回复:', jsonData.content)
          // 如果是完整的 AI 回复消息
          if (jsonData.content) {
            this.addAiMessage(jsonData.content, characterId, null, true)
          }
          return
        }
      } catch (e) {
        // 不是 JSON，继续作为流式文本处理
      }

      // 处理流式文本
      const textChunk = textData
      const streamEndSignal = '[STREAM_END]'

      // 检查是否包含流结束信号（支持粘包情况）
      if (textChunk.includes(streamEndSignal)) {
        console.log('检测到流结束信号，原文内容:', textChunk)

        // 分离内容和信号（处理可能出现的多个信号）
        const parts = textChunk.split(streamEndSignal)
        const realContent = parts[0] // 信号前的实际内容

        // 如果有剩余文本，先追加到当前消息
        if (realContent && realContent.trim()) {
          const messages = this.conversations[characterId] || []
          const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null

          if (lastMessage && lastMessage.type === 'ai' && !lastMessage.isComplete) {
            messages[messages.length - 1] = {
              ...lastMessage,
              content: lastMessage.content + realContent
            }
            console.log('追加文本块（流结束前）:', realContent)
          }
        }

        // 强制标记最后一条未完成的 AI 消息为完成状态（关键修复）
        const messages = this.conversations[characterId]
        if (messages && messages.length > 0) {
          const lastMessage = messages[messages.length - 1]

          // 只要是 AI 消息且未完成，强制标记完成（移除光标）
          if (lastMessage.type === 'ai' && !lastMessage.isComplete) {
            messages[messages.length - 1] = {
              ...lastMessage,
              isComplete: true
            }
            console.log('✅ AI消息流完成，已移除光标')
          } else {
            console.log('⚠️ 最后一条消息状态异常:', {
              type: lastMessage?.type,
              isComplete: lastMessage?.isComplete,
              hasMessages: messages.length > 0
            })
          }
        } else {
          console.log('⚠️ 没有找到消息历史')
        }

        return
      }

      // 查找当前角色的对话历史中最后一条消息
      const messages = this.conversations[characterId] || []
      const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null

      if (lastMessage && lastMessage.type === 'ai' && !lastMessage.isComplete) {
        // 追加到现有的未完成消息（替换整个对象以触发 Vue 响应式更新）
        messages[messages.length - 1] = {
          ...lastMessage,
          content: lastMessage.content + textChunk
        }
        console.log('追加文本块:', textChunk)
      } else {
        // 创建新的未完成 AI 消息
        console.log('创建新的流式消息:', textChunk)
        this.addAiMessage(textChunk, characterId, null, false)
      }
    }
  }
})
