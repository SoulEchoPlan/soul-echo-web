import config from '@/config'
import { handleWebSocketError, devLog } from '@/utils/errorHandler'

class WebSocketService {
  constructor() {
    this.socket = null
    this.messageHandler = null
    this.connectionHandler = null
    this.errorHandler = null
  }

  async connect(character) {
    if (!character) {
      throw new Error('无效的角色数据')
    }

    // 先断开现有连接
    this.disconnect()

    return new Promise((resolve, reject) => {
      try {
        // 构建WebSocket URL
        const encodedPersonaPrompt = encodeURIComponent(character.personaPrompt || '')
        const wsUrl = `${config.WS_BASE_URL}/chat?characterId=${encodeURIComponent(character.id)}&personaPrompt=${encodedPersonaPrompt}`

        this.socket = new WebSocket(wsUrl)
        this.socket.binaryType = "arraybuffer"

        this.socket.onopen = () => {
          devLog(`WebSocket连接已建立，角色ID: ${character.id}`)
          resolve()
        }

        this.socket.onmessage = (event) => {
          if (this.messageHandler) {
            this.messageHandler(event)
          }
        }

      this.socket.onerror = (error) => {
          handleWebSocketError(error, 'WebSocket连接错误')
          if (this.errorHandler) {
            this.errorHandler(error)
          }
          reject(error)
        }

        this.socket.onclose = () => {
          devLog('WebSocket连接已关闭')
          if (this.connectionHandler) {
            this.connectionHandler(false)
          }
        }

      } catch (error) {
        handleWebSocketError(error, 'WebSocket初始化失败')
        reject(error)
      }
    })
  }

  disconnect() {
    if (this.socket && this.socket.readyState !== WebSocket.CLOSED) {
      this.socket.close()
      this.socket = null
    }
  }

  send(message) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket未连接')
    }

    this.socket.send(message)
  }

  isConnected() {
    return this.socket && this.socket.readyState === WebSocket.OPEN
  }

  // 设置消息处理器
  onMessage(handler) {
    this.messageHandler = handler
  }

  // 设置连接状态处理器
  onConnectionChange(handler) {
    this.connectionHandler = handler
  }

  // 设置错误处理器
  onError(handler) {
    this.errorHandler = handler
  }
}

export const websocketService = new WebSocketService()