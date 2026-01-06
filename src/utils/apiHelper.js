import { ErrorCodes, ErrorMessages } from '@/constants/errorCodes'

/**
 * 判断响应是否为新格式的 ApiResponse
 * 使用 timestamp 字段作为核心判断依据
 * @param {any} result - 响应结果
 * @returns {boolean} 是否为新格式响应
 */
export function isApiResponse(result) {
  return (
    result !== null &&
    typeof result === 'object' &&
    typeof result.code === 'number' &&
    typeof result.message === 'string' &&
    typeof result.timestamp === 'number'
  )
}

/**
 * API 错误类
 * 携带错误码和消息
 */
export class ApiError extends Error {
  /**
   * @param {number} code - 错误码
   * @param {string} message - 错误消息
   */
  constructor(code, message) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

/**
 * 获取用户友好的错误消息
 * @param {Error|ApiError|any} error - 错误对象
 * @returns {string} 用户友好的错误消息
 */
export function getErrorMessage(error) {
  // 如果是 ApiError，优先使用预定义消息
  if (error instanceof ApiError) {
    return ErrorMessages[error.code] || error.message || '操作失败'
  }

  // 如果是普通 Error
  if (error instanceof Error) {
    return error.message || '操作失败'
  }

  // 如果是字符串
  if (typeof error === 'string') {
    return error
  }

  return '操作失败'
}

/**
 * 判断错误码是否为成功
 * @param {number} code - 错误码
 * @returns {boolean} 是否成功
 */
export function isSuccess(code) {
  return code === ErrorCodes.SUCCESS
}
