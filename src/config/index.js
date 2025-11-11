/**
 * 项目配置管理
 * 用于统一管理所有 API 和 WebSocket 地址等配置
 */

const config = {
  // API 配置
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',

  // WebSocket 配置
  WS_BASE_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:8080',

  // 应用配置
  APP_NAME: '魂语计划',
  APP_VERSION: '1.0.0',

  // 音频配置
  AUDIO: {
    SAMPLE_RATE: 16000,
    CHUNK_SIZE: 1024,
    RECORD_INTERVAL: 100, // 录音数据发送间隔(ms)
  },

  // 消息配置
  MESSAGE: {
    MAX_LENGTH: 10000, // 最大消息长度
    SCROLL_DELAY: 100, // 滚动延迟时间(ms)
  },

  // 连接配置
  CONNECTION: {
    RECONNECT_INTERVAL: 1000, // 重连间隔(ms)
    MAX_RECONNECT_ATTEMPTS: 5, // 最大重连次数
    TIMEOUT: 10000, // 连接超时时间(ms)
  }
}

export default config