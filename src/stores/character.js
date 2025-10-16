import { defineStore } from 'pinia'
import { api } from '@/services/api'

export const useCharacterStore = defineStore('character', {
  state: () => ({
    characters: [],
    activeCharacterId: null,
    isLoading: false
  }),

  getters: {
    activeCharacter: (state) => {
      return state.characters.find(char => char.id === state.activeCharacterId)
    },
    hasCharacters: (state) => {
      return state.characters.length > 0
    }
  },

  actions: {
    async fetchCharacters() {
      this.isLoading = true
      try {
        const data = await api.getCharacters()
        this.characters = data

        // 设置第一个角色为激活状态
        if (this.characters.length > 0 && !this.activeCharacterId) {
          this.activeCharacterId = this.characters[0].id
        }
      } catch (error) {
        console.error('获取角色数据失败:', error)
        // 设置默认数据作为后备
        this.characters = [
          {
            id: 0,
            name: '连接失败',
            personaPrompt: '无法连接到服务器，请检查后端服务是否启动。',
            avatarUrl: '',
            voiceId: '',
            isPublic: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
      } finally {
        this.isLoading = false
      }
    },

    setActiveCharacter(id) {
      if (this.characters.find(char => char.id === id)) {
        this.activeCharacterId = id
      }
    },

    async createCharacter(characterData) {
      try {
        const newCharacter = await api.createCharacter(characterData)
        // 重新获取角色列表
        await this.fetchCharacters()
        return newCharacter
      } catch (error) {
        console.error('创建角色失败:', error)
        throw error
      }
    },

    async updateCharacter(characterData) {
      try {
        if (!characterData.id) {
          throw new Error('角色ID不能为空')
        }
        const updatedCharacter = await api.updateCharacter(characterData.id, characterData)
        // 更新本地角色数据
        const index = this.characters.findIndex(char => char.id === characterData.id)
        if (index !== -1) {
          this.characters[index] = updatedCharacter
        }
        return updatedCharacter
      } catch (error) {
        console.error('更新角色失败:', error)
        throw error
      }
    },

    async deleteCharacter(id) {
      try {
        await api.deleteCharacter(id)
        // 从本地列表中移除
        this.characters = this.characters.filter(char => char.id !== id)

        // 如果删除的是当前激活的角色，重新选择激活角色
        if (this.activeCharacterId === id) {
          this.activeCharacterId = this.characters.length > 0 ? this.characters[0].id : null
        }
      } catch (error) {
        console.error('删除角色失败:', error)
        throw error
      }
    },

    async getCharacter(id) {
      try {
        return await api.getCharacter(id)
      } catch (error) {
        console.error('获取角色详情失败:', error)
        throw error
      }
    },

    searchCharacters(searchTerm) {
      if (!searchTerm) {
        return this.characters
      }
      const term = searchTerm.toLowerCase()
      return this.characters.filter(char =>
        char.name.toLowerCase().includes(term) ||
        char.personaPrompt.toLowerCase().includes(term)
      )
    }
  }
})