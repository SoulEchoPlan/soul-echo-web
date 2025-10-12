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
      this.conversations[characterId].push(message)
    },

    addUserMessage(content, characterId) {
      this.addMessage({
        type: 'user',
        content,
        timestamp: new Date().toISOString()
      }, characterId)
    },

    addAiMessage(content, characterId, audioUrl = null) {
      this.addMessage({
        type: 'ai',
        content,
        audioUrl,
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
      } else {
        // 处理文本消息
        try {
          const textMessage = typeof event.data === 'string' ? event.data : event.data.toString()
          console.log('收到文本消息:', textMessage)
          this.addAiMessage(textMessage, characterId)
        } catch (error) {
          console.error('处理文本消息失败:', error)
          this.addErrorMessage('消息处理失败', characterId)
        }
      }
    }
  }
})