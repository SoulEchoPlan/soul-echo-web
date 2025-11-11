/**
 * 输入验证工具
 * 用于验证用户输入的安全性和合法性
 */

import config from '@/config'
import { getErrorMessage } from './errorHandler'

/**
 * 验证消息内容
 * @param {string} content - 消息内容
 * @returns {Object} 验证结果 { isValid: boolean, message?: string }
 */
export const validateMessage = (content) => {
  // 检查是否为字符串
  if (typeof content !== 'string') {
    return {
      isValid: false,
      message: '消息内容必须是字符串'
    }
  }

  // 检查是否为空
  if (!content || content.trim().length === 0) {
    return {
      isValid: false,
      message: '消息内容不能为空'
    }
  }

  // 检查消息长度
  if (content.length > config.MESSAGE.MAX_LENGTH) {
    return {
      isValid: false,
      message: `消息内容过长，最大支持 ${config.MESSAGE.MAX_LENGTH} 个字符`
    }
  }

  // 检查是否包含恶意脚本（基础XSS防护）
  const xssPatterns = [
    /<script[^>]*>/i,
    /<iframe[^>]*>/i,
    /<object[^>]*>/i,
    /<embed[^>]*>/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<link[^>]*>/i,
    /<meta[^>]*>/i
  ]

  for (const pattern of xssPatterns) {
    if (pattern.test(content)) {
      return {
        isValid: false,
        message: '消息内容包含不安全的字符'
      }
    }
  }

  return {
    isValid: true
  }
}

/**
 * 验证角色数据
 * @param {Object} character - 角色对象
 * @returns {Object} 验证结果
 */
export const validateCharacter = (character) => {
  if (!character || typeof character !== 'object') {
    return {
      isValid: false,
      message: '角色数据无效'
    }
  }

  // 检查必需字段
  const requiredFields = ['id', 'name']
  for (const field of requiredFields) {
    if (!character[field]) {
      return {
        isValid: false,
        message: `角色缺少必需字段: ${field}`
      }
    }
  }

  // 验证角色名称
  if (typeof character.name !== 'string' || character.name.trim().length === 0) {
    return {
      isValid: false,
      message: '角色名称不能为空'
    }
  }

  if (character.name.length > 50) {
    return {
      isValid: false,
      message: '角色名称过长，最大支持50个字符'
    }
  }

  // 验证头像URL（可选）
  if (character.avatarUrl && typeof character.avatarUrl !== 'string') {
    return {
      isValid: false,
      message: '头像URL格式无效'
    }
  }

  // 验证角色设定（可选）
  if (character.personaPrompt && typeof character.personaPrompt !== 'string') {
    return {
      isValid: false,
      message: '角色设定格式无效'
    }
  }

  return {
    isValid: true
  }
}

/**
 * 清理和转义HTML内容
 * @param {string} content - 原始内容
 * @returns {string} 清理后的安全内容
 */
export const sanitizeHtml = (content) => {
  if (typeof content !== 'string') {
    return ''
  }

  return content
    // 转义HTML特殊字符
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * 验证URL格式
 * @param {string} url - URL字符串
 * @returns {boolean} 是否为有效URL
 */
export const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return false
  }

  try {
    const urlObj = new URL(url)
    // 只允许 http 和 https 协议
    return ['http:', 'https:'].includes(urlObj.protocol)
  } catch {
    return false
  }
}

/**
 * 验证音频文件格式
 * @param {File|Blob} file - 音频文件
 * @returns {Object} 验证结果
 */
export const validateAudioFile = (file) => {
  if (!file) {
    return {
      isValid: false,
      message: '音频文件无效'
    }
  }

  // 检查文件类型
  const allowedTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/webm', 'audio/ogg']
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      message: '不支持的音频格式，请使用 WAV、MP3、WebM 或 OGG 格式'
    }
  }

  // 检查文件大小（限制为 50MB）
  const maxSize = 50 * 1024 * 1024
  if (file.size > maxSize) {
    return {
      isValid: false,
      message: '音频文件过大，最大支持 50MB'
    }
  }

  return {
    isValid: true
  }
}

/**
 * 验证邮箱格式
 * @param {string} email - 邮箱地址
 * @returns {boolean} 是否为有效邮箱
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 创建输入验证装饰器
 * @param {Function} validator - 验证函数
 * @param {string} errorMessage - 错误信息
 * @returns {Function} 验证装饰器函数
 */
export const createValidator = (validator, errorMessage) => {
  return (value) => {
    const result = validator(value)
    if (!result.isValid) {
      throw new Error(result.message || errorMessage)
    }
    return value
  }
}

/**
 * 批量验证
 * @param {Array} validators - 验证器数组，每个元素包含 { value, validator, errorMessage }
 * @returns {Object} 批量验证结果
 */
export const validateBatch = (validators) => {
  const errors = []

  for (const { value, validator, field } of validators) {
    try {
      const result = validator(value)
      if (!result.isValid) {
        errors.push({ field, message: result.message })
      }
    } catch (error) {
      errors.push({ field, message: error.message })
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}