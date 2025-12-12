const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080'

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
        const wsUrl = `${WS_BASE_URL}/chat?characterId=${encodeURIComponent(character.id)}&personaPrompt=${encodedPersonaPrompt}`

        this.socket = new WebSocket(wsUrl)
        this.socket.binaryType = "arraybuffer"

        this.socket.onopen = () => {
          console.log(`WebSocket连接已建立，角色ID: ${character.id}`)
          resolve()
        }

        this.socket.onmessage = (event) => {
          if (this.messageHandler) {
            this.messageHandler(event)
          }
        }

        this.socket.onerror = (error) => {
          console.error('WebSocket错误:', error)
          if (this.errorHandler) {
            this.errorHandler(error)
          }
          reject(error)
        }

        this.socket.onclose = () => {
          console.log('WebSocket连接已关闭')
          if (this.connectionHandler) {
            this.connectionHandler(false)
          }
        }

      } catch (error) {
        console.error('WebSocket初始化失败:', error)
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