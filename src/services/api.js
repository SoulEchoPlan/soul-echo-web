const API_BASE_URL = 'http://localhost:8080/api'

class ApiService {
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API请求失败 (${endpoint}):`, error)
      throw error
    }
  }

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

  // 知识库相关 API
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
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