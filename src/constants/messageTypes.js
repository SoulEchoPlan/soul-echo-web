/**
 * WebSocket 消息类型常量
 * 同步后端 MessageTypeConstants.java
 */
export const MessageTypes = {
  /** 应用层心跳请求 */
  PING: 'ping',
  /** 应用层心跳响应 */
  PONG: 'pong',
  /** 用户语音转写 */
  USER_TRANSCRIPTION: 'user-transcription',
  /** 错误消息 */
  ERROR: 'error',
  /** AI 回复 */
  AI_REPLY: 'ai-reply',
  /** 音频信息 */
  AUDIO_INFO: 'audio-info'
}
