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

    async addCharacter(characterData) {
      try {
        await api.createCharacter(characterData)
        // 重新获取角色列表
        await this.fetchCharacters()
        return true
      } catch (error) {
        console.error('创建角色失败:', error)
        throw error
      }
    },

    searchCharacters(searchTerm) {
      if (!searchTerm) {
        return this.characters
      }
      const term = searchTerm.toLowerCase()
      return this.characters.filter(char =>
        char.name.toLowerCase().includes(term)
      )
    }
  }
})