<template>
  <div class="sidebar">
    <CharacterSearch @search="handleSearch" @add="handleAdd" />
    <ul class="character-list">
      <CharacterListItem
        v-for="character in displayCharacters"
        :key="character.id"
        :character="character"
        :active-character-id="activeCharacterId"
        @select="handleSelect"
      />
      <li v-if="isLoading" class="loading-item">
        正在加载角色数据...
      </li>
      <li v-if="!isLoading && displayCharacters.length === 0" class="empty-item">
        没有找到角色
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCharacterStore } from '@/stores/character'
import { useChatStore } from '@/stores/chat'
import CharacterListItem from './CharacterListItem.vue'
import CharacterSearch from './CharacterSearch.vue'

const characterStore = useCharacterStore()
const chatStore = useChatStore()

const searchTerm = ref('')
const isLoading = computed(() => characterStore.isLoading)
const activeCharacterId = computed(() => characterStore.activeCharacterId)

const displayCharacters = computed(() => {
  if (searchTerm.value) {
    return characterStore.searchCharacters(searchTerm.value)
  }
  return characterStore.characters
})

const handleSearch = (term) => {
  searchTerm.value = term
}

const handleAdd = () => {
  // 新增角色后重新加载
  characterStore.fetchCharacters()
}

const handleSelect = async (characterId) => {
  const previousCharacterId = activeCharacterId.value

  // 更新选中的角色
  characterStore.setActiveCharacter(characterId)

  // 如果角色发生变化，重新连接WebSocket
  if (previousCharacterId !== characterId) {
    const activeCharacter = characterStore.activeCharacter

    // 断开现有连接
    chatStore.disconnect()

    // 建立新连接
    try {
      await chatStore.connect(activeCharacter)
    } catch (error) {
      console.error('连接WebSocket失败:', error)
      chatStore.addErrorMessage('连接失败，请刷新页面重试', characterId)
    }
  }
}

onMounted(() => {
  // 初始化时加载角色数据
  characterStore.fetchCharacters()
})
</script>

