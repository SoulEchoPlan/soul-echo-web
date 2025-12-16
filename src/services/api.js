import { isApiResponse, ApiError } from '@/utils/apiHelper'
import { ErrorCodes } from '@/constants/errorCodes'

const API_BASE_URL = 'http://localhost:8080/api'

class ApiService {
  /**
   * 通用请求方法
   * 支持新旧两种响应格式的兼容处理
   * @param {string} endpoint - API 端点
   * @param {RequestInit} options - fetch 配置项
   * @returns {Promise<any>} 响应数据
   * @throws {ApiError} API 业务错误
   * @throws {Error} 网络或其他错误
   */
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    }

    try {
      const response = await fetch(url, config)

      // 检查 HTTP 状态
      if (!response.ok) {
        // 尝试解析错误响应体
        try {
          const errorResult = await response.json()
          if (isApiResponse(errorResult)) {
            throw new ApiError(errorResult.code, errorResult.message)
          }
        } catch (parseError) {
          // 如果解析失败，抛出通用 HTTP 错误
          if (parseError instanceof ApiError) {
            throw parseError
          }
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // 解析 JSON 响应
      const result = await response.json()

      // 判断是否为新格式 ApiResponse
      if (isApiResponse(result)) {
        // 新格式处理
        if (result.code !== ErrorCodes.SUCCESS) {
          throw new ApiError(result.code, result.message)
        }
        // 成功时返回 data（data 可能为 undefined，如删除接口）
        return result.data ?? null
      }

      // 旧格式：直接返回 result
      return result
    } catch (error) {
      // 如果是 ApiError，直接抛出
      if (error instanceof ApiError) {
        console.error(`API业务错误 (${endpoint}):`, error.code, error.message)
        throw error
      }

      console.error(`API请求失败 (${endpoint}):`, error)
      throw error
    }
  }

  // ==================== 角色相关 API ====================

  async getCharacters() {
    return await this.request('/characters')
  }

  async createCharacter(characterData) {
    return await this.request('/characters', {
      method: 'POST',
      body: JSON.stringify(characterData)
    })
  }

  async getCharacter(id) {
    return await this.request(`/characters/${id}`)
  }

  async updateCharacter(id, characterData) {
    return await this.request(`/characters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(characterData)
    })
  }

  async deleteCharacter(id) {
    return await this.request(`/characters/${id}`, {
      method: 'DELETE'
    })
  }

  // ==================== 知识库相关 API ====================

  /**
   * 上传知识库文件
   * @param {File} file - 文件对象
   * @param {string} characterId - 角色 ID
   * @returns {Promise<any>} 上传结果
   */
  async uploadKnowledgeFile(file, characterId) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('characterId', characterId)

    const url = `${API_BASE_URL}/knowledge/upload`

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData
      })

      // 检查 HTTP 状态
      if (!response.ok) {
        try {
          const errorResult = await response.json()
          if (isApiResponse(errorResult)) {
            throw new ApiError(errorResult.code, errorResult.message)
          }
        } catch (parseError) {
          if (parseError instanceof ApiError) {
            throw parseError
          }
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      // 判断是否为新格式
      if (isApiResponse(result)) {
        if (result.code !== ErrorCodes.SUCCESS) {
          throw new ApiError(result.code, result.message)
        }
        return result.data ?? null
      }

      return result
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('知识库文件上传失败:', error.code, error.message)
        throw error
      }

      console.error('知识库文件上传失败:', error)
      throw error
    }
  }

  async getCharacterKnowledge(characterId) {
    return await this.request(`/knowledge?characterId=${characterId}`)
  }

  async deleteKnowledgeFile(id) {
    return await this.request(`/knowledge/${id}`, {
      method: 'DELETE'
    })
  }
}

export const api = new ApiService()
