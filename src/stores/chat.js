import { defineStore } from 'pinia'
import { websocketService } from '@/services/websocket'
import { useCharacterStore } from './character'
import AudioStreamPlayer from '@/services/AudioStreamPlayer'
import { handleWebSocketError, handleAudioError, devLog } from '@/utils/errorHandler'
import { validateMessage, sanitizeHtml } from '@/utils/validators'
import config from '@/config'

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
        devLog('WebSocket未连接，无法发送消息', 'Warning')
        return false
      }

      try {
        // 验证消息内容
        const validation = validateMessage(message)
        if (!validation.isValid) {
          handleWebSocketError(new Error(validation.message), '发送消息失败')
          return false
        }

        // 清理消息内容，防止XSS攻击
        const sanitizedMessage = sanitizeHtml(message.trim())

        if (!sanitizedMessage) {
          handleWebSocketError(new Error('消息内容为空'), '发送消息失败')
          return false
        }

        websocketService.send(sanitizedMessage)
        devLog(`消息已发送: ${sanitizedMessage.substring(0, 50)}...`)
        return true
      } catch (error) {
        handleWebSocketError(error, '发送消息失败')
        return false
      }
    },

    addMessage(message, characterId) {
      if (!characterId) {
        devLog('角色ID无效，无法添加消息', 'Error')
        return
      }

      if (!this.conversations[characterId]) {
        this.conversations[characterId] = []
      }

      try {
        // 对消息内容进行安全处理
        if (message.content) {
          message.content = sanitizeHtml(message.content)
        }

        // 确保消息对象包含 isComplete 属性（默认为 true）
        const messageWithComplete = {
          ...message,
          isComplete: message.isComplete !== undefined ? message.isComplete : true,
          timestamp: message.timestamp || new Date().toISOString()
        }

        this.conversations[characterId].push(messageWithComplete)
        devLog(`消息已添加到角色 ${characterId} 的对话记录中`)
      } catch (error) {
        handleWebSocketError(error, '添加消息失败')
      }
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
      if (!characterId) {
        devLog('收到消息但角色ID无效', 'Error')
        return
      }

      // 处理二进制音频数据 - 使用流式播放器
      if (event.data instanceof ArrayBuffer) {
        devLog(`收到音频数据块: ${event.data.byteLength} bytes`)
        try {
          this.audioPlayer.receive(event.data)
        } catch (error) {
          handleAudioError(error, '音频流处理失败')
        }
        return
      }

      // 处理文本消息
      const textData = typeof event.data === 'string' ? event.data : event.data.toString()

      // 尝试解析为 JSON（用于用户语音回显）
      try {
        const jsonData = JSON.parse(textData)

        if (jsonData.type === 'user-transcription') {
          // 用户语音识别结果回显
          devLog(`收到用户语音识别: ${jsonData.content.substring(0, 50)}...`)
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
        devLog('收到流结束信号')
        const messages = this.conversations[characterId]
        if (messages && messages.length > 0) {
          const lastMessage = messages[messages.length - 1]
          if (lastMessage.type === 'ai' && !lastMessage.isComplete) {
            lastMessage.isComplete = true
            devLog('AI消息流完成')
          }
        }
        return
      }

      // 查找当前角色的对话历史中最后一条消息
      const messages = this.conversations[characterId] || []
      const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null

      if (lastMessage && lastMessage.type === 'ai' && !lastMessage.isComplete) {
        // 追加到现有的未完成消息
        lastMessage.content += sanitizeHtml(textChunk)
        devLog(`追加文本块: ${textChunk.substring(0, 20)}...`)
      } else {
        // 创建新的未完成 AI 消息
        devLog(`创建新的流式消息: ${textChunk.substring(0, 20)}...`)
        this.addAiMessage(sanitizeHtml(textChunk), characterId, null, false)
      }
    }
  }
})