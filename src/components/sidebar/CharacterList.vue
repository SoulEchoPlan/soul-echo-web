<template>
  <div class="sidebar">
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
import { computed, onMounted } from 'vue'
import { useCharacterStore } from '@/stores/character'
import { useChatStore } from '@/stores/chat'
import CharacterListItem from './CharacterListItem.vue'

const characterStore = useCharacterStore()
const chatStore = useChatStore()

const isLoading = computed(() => characterStore.isLoading)
const activeCharacterId = computed(() => characterStore.activeCharacterId)

// 始终返回所有角色，移除搜索逻辑
const displayCharacters = computed(() => {
  return characterStore.characters
})

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

onMounted(async () => {
  // 初始化时加载角色数据
  await characterStore.fetchCharacters()

  // 如果存在默认角色，自动建立 WebSocket 连接
  if (characterStore.activeCharacter) {
    try {
      await chatStore.connect(characterStore.activeCharacter)
    } catch (error) {
      console.error('初始化WebSocket连接失败:', error)
      chatStore.addErrorMessage('连接失败，请刷新页面重试', characterStore.activeCharacterId)
    }
  }
})
</script>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%; /* 继承父组件的宽度 */
  background-color: var(--panel-bg);
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: var(--shadow);
}

.character-list {
  list-style: none;
  overflow-y: auto;
  flex-grow: 1;
  scrollbar-width: thin;
  scrollbar-color: var(--border-color) transparent;
}

.loading-item,
.empty-item {
  padding: 2rem;
  text-align: center;
  color: var(--text-muted);
}
</style>