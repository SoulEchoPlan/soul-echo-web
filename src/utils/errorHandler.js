/**
 * 全局错误处理器
 * 统一处理应用中的各种错误情况
 */

import config from '@/config'

/**
 * 显示友好的错误提示
 * @param {string} message - 错误信息
 * @param {string} type - 错误类型 ('error', 'warning', 'info')
 */
export const showNotification = (message, type = 'error') => {
  // 检查是否有全局的通知系统
  if (typeof window !== 'undefined' && window.showNotification) {
    window.showNotification(message, type)
  } else {
    // 降级到 console 输出
    console.error(`[${type.toUpperCase()}] ${message}`)
  }
}

/**
 * 错误信息映射表
 * 将技术错误转换为用户友好的提示
 */
const ERROR_MESSAGES = {
  // 网络错误
  'Network Error': '网络连接失败，请检查网络设置',
  'Connection failed': '无法连接到服务器，请稍后重试',
  'Connection timeout': '连接超时，请检查网络连接',
  'WebSocket connection failed': '实时通信连接失败，请刷新页面重试',

  // 权限错误
  'Permission denied': '权限不足，请检查麦克风等设备权限',
  'NotAllowedError': '未授权访问设备，请在浏览器设置中允许权限',

  // 设备错误
  'Device not found': '未找到音频设备，请检查麦克风连接',
  'No microphone found': '未找到麦克风，请确保设备已连接',

  // API 错误
  'Invalid request': '请求参数无效，请重试',
  'Server error': '服务器内部错误，请稍后重试',
  'Service unavailable': '服务暂时不可用，请稍后重试',

  // 音频错误
  'Audio playback failed': '音频播放失败，请检查设备音量设置',
  'Audio recording failed': '录音失败，请检查麦克风权限',
  'Audio context suspended': '音频上下文已暂停，请点击页面任意位置激活',

  // 默认错误
  'default': '操作失败，请重试'
}

/**
 * 获取用户友好的错误信息
 * @param {Error|string} error - 错误对象或错误信息
 * @returns {string} 用户友好的错误信息
 */
export const getErrorMessage = (error) => {
  const errorMessage = error?.message || error || '未知错误'

  // 查找匹配的错误信息
  for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
    if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
      return value
    }
  }

  return ERROR_MESSAGES.default
}

/**
 * 处理 API 错误
 * @param {Error} error - 错误对象
 * @param {string} context - 错误上下文信息
 */
export const handleApiError = (error, context = '') => {
  const errorMessage = getErrorMessage(error)
  const fullMessage = context ? `${context}: ${errorMessage}` : errorMessage

  console.error('API Error:', error)
  showNotification(fullMessage, 'error')
}

/**
 * 处理 WebSocket 错误
 * @param {Error} error - 错误对象
 * @param {string} context - 错误上下文信息
 */
export const handleWebSocketError = (error, context = '') => {
  const errorMessage = getErrorMessage(error)
  const fullMessage = context ? `${context}: ${errorMessage}` : errorMessage

  console.error('WebSocket Error:', error)
  showNotification(fullMessage, 'error')
}

/**
 * 处理音频错误
 * @param {Error} error - 错误对象
 * @param {string} context - 错误上下文信息
 */
export const handleAudioError = (error, context = '') => {
  const errorMessage = getErrorMessage(error)
  const fullMessage = context ? `${context}: ${errorMessage}` : errorMessage

  console.error('Audio Error:', error)
  showNotification(fullMessage, 'error')
}

/**
 * 处理通用错误
 * @param {Error} error - 错误对象
 * @param {string} context - 错误上下文
 * @param {string} type - 错误类型
 */
export const handleError = (error, context = '', type = 'error') => {
  const errorMessage = getErrorMessage(error)
  const fullMessage = context ? `${context}: ${errorMessage}` : errorMessage

  console.error(`${type.toUpperCase()} Error:`, error)
  showNotification(fullMessage, type)
}

/**
 * 开发环境下的详细错误日志
 * @param {any} data - 需要记录的数据
 * @param {string} label - 标签
 */
export const devLog = (data, label = 'Debug') => {
  if (import.meta.env.DEV) {
    console.log(`[${label}]`, data)
  }
}

/**
 * 创建错误边界处理器
 * @param {Function} fallback - 错误降级处理函数
 * @returns {Function} 错误处理函数
 */
export const createErrorBoundary = (fallback) => {
  return (error, context = '') => {
    handleError(error, context, 'error')
    if (typeof fallback === 'function') {
      fallback()
    }
  }
}