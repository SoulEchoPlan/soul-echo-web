import { MessageTypes } from '@/constants/messageTypes'

const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080'

class WebSocketService {
  constructor() {
    this.socket = null
    this.messageHandler = null
    this.connectionHandler = null
    this.errorHandler = null

    // 心跳相关
    this.pingInterval = null           // 定时发送 ping 的定时器
    this.pongTimeout = null            // 等待 pong 响应的超时定时器
    this.PING_INTERVAL = 30000         // ping 间隔时间：30秒
    this.PONG_TIMEOUT = 5000           // pong 超时时间：5秒
    this.currentCharacter = null       // 保存当前连接的角色，用于重连
    this.isManualDisconnect = false    // 标记是否为手动断开
    this.isSwitching = false           // 标记是否正在切换连接
  }

  async connect(character) {
    if (!character) {
      throw new Error('无效的角色数据')
    }

    // 保存当前角色信息，用于重连
    this.currentCharacter = character
    this.isManualDisconnect = false

    // 如果存在旧连接，标记为切换状态并断开
    if (this.socket) {
      this.isSwitching = true
      console.log('检测到旧连接，准备切换到新角色:', character.id)
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
          // 连接成功后，清除切换标记
          this.isSwitching = false
          // 启动心跳机制
          this.startHeartbeat()
          resolve()
        }

        this.socket.onmessage = (event) => {
          // 拦截心跳 pong 消息和结构化错误消息
          if (typeof event.data === 'string') {
            try {
              const message = JSON.parse(event.data)

              // 处理心跳响应
              if (message.type === MessageTypes.PONG) {
                // 收到 pong，清除超时计时器
                if (this.pongTimeout) {
                  clearTimeout(this.pongTimeout)
                  this.pongTimeout = null
                }
                console.log('收到心跳响应 pong')
                // 不传递给上层业务逻辑
                return
              }

              // 处理结构化错误消息
              if (message.type === MessageTypes.ERROR) {
                console.error('WebSocket 错误消息:', message.content)
                // 传递给上层处理错误
                if (this.messageHandler) {
                  this.messageHandler(event)
                }
                return
              }
            } catch (e) {
              // 不是 JSON 格式，继续传递给上层处理
            }
          }

          // 传递给上层业务逻辑
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

        this.socket.onclose = (event) => {
          // 停止心跳
          this.stopHeartbeat()

          // 如果是切换状态或者是正常关闭（Code 1000），不触发连接错误处理
          if (this.isSwitching || event.code === 1000) {
            console.log('WebSocket正常关闭（切换角色或主动断开），Code:', event.code)
          } else {
            // 只有非预期的关闭才触发连接错误处理
            console.log('WebSocket意外断开，Code:', event.code)
            if (this.connectionHandler) {
              this.connectionHandler(false)
            }
          }

          // 只有在非切换状态时才将 socket 置为 null
          // 这样在切换过程中，socket 对象仍然存在，避免竞态条件
          if (!this.isSwitching) {
            this.socket = null
          }
        }

      } catch (error) {
        console.error('WebSocket初始化失败:', error)
        reject(error)
      }
    })
  }

  disconnect() {
    this.isSwitching = true           // 标记为切换状态
    this.isManualDisconnect = true    // 标记为手动断开
    this.stopHeartbeat()              // 停止心跳
    if (this.socket && this.socket.readyState !== WebSocket.CLOSED) {
      this.socket.close()
      this.socket = null
    }
    this.currentCharacter = null
  }

  /**
   * 重置切换状态
   * 用于异常情况下强制重置状态位
   */
  resetState() {
    this.isSwitching = false
    console.log('WebSocket切换状态已重置')
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

  // ==================== 心跳机制 ====================

  /**
   * 启动心跳机制
   * 每隔 PING_INTERVAL 发送一次 ping 消息
   */
  startHeartbeat() {
    // 清除之前的定时器
    this.stopHeartbeat()

    console.log('启动心跳机制')

    // 立即发送一次 ping
    this.sendPing()

    // 设置定时发送 ping
    this.pingInterval = setInterval(() => {
      this.sendPing()
    }, this.PING_INTERVAL)
  }

  /**
   * 发送 ping 消息
   * 并启动 pong 超时计时器
   */
  sendPing() {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket 未连接，无法发送 ping')
      this.stopHeartbeat()
      return
    }

    try {
      // 发送 ping 消息（使用常量）
      const pingMessage = JSON.stringify({ type: MessageTypes.PING })
      this.socket.send(pingMessage)
      console.log('发送心跳 ping')

      // 清除之前的 pong 超时计时器
      if (this.pongTimeout) {
        clearTimeout(this.pongTimeout)
      }

      // 启动 pong 超时计时器
      this.pongTimeout = setTimeout(() => {
        console.warn('心跳超时，未收到 pong 响应，关闭连接')
        // 判定连接断开，关闭 socket 并触发重连
        if (this.socket) {
          this.socket.close()
        }
      }, this.PONG_TIMEOUT)

    } catch (error) {
      console.error('发送 ping 失败:', error)
    }
  }

  /**
   * 停止心跳机制
   * 清除所有定时器
   */
  stopHeartbeat() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
    if (this.pongTimeout) {
      clearTimeout(this.pongTimeout)
      this.pongTimeout = null
    }
    console.log('停止心跳机制')
  }
}

export const websocketService = new WebSocketService()
