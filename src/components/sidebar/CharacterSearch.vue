<template>
  <div class="search-area">
    <label>
      <input
        type="search"
        class="search-input"
        placeholder="搜索角色"
        v-model="searchTerm"
        @input="handleSearch"
      />
    </label>
    <button class="search-btn" @click="handleSearch">搜索</button>
    <button class="add-btn" @click="handleAddCharacter">新增</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCharacterStore } from '@/stores/character'

const searchTerm = ref('')
const characterStore = useCharacterStore()

const emit = defineEmits(['search', 'add'])

const handleSearch = () => {
  emit('search', searchTerm.value)
}

const handleAddCharacter = async () => {
  const name = prompt("请输入新角色的名称:")
  if (!name) return

  const personaPrompt = prompt("请输入新角色的设定:")
  if (!personaPrompt) return

  try {
    await characterStore.addCharacter({
      name,
      personaPrompt,
      avatarUrl: 'https://i.pravatar.cc/150'
    })

    alert('角色创建成功！')
    emit('add') // 通知父组件刷新列表
  } catch (error) {
    console.error('创建角色失败:', error)
    alert('创建角色失败，请查看控制台日志。')
  }
}
</script>

<style scoped>
.search-area {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.search-area .search-input {
  flex-grow: 1;
  padding: 0.75rem 1rem;
  background-color: var(--secondary-bg);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  transition: border-color 0.2s ease;
}

.search-area .search-input:focus {
  border-color: var(--accent-color);
}

.search-area .search-input::placeholder {
  color: var(--text-muted);
}

.search-area .search-btn,
.search-area .add-btn {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.search-area .search-btn {
  background-color: var(--secondary-bg);
}

.search-area .add-btn {
  background-color: var(--accent-color);
  color: white;
}

.search-area .add-btn:hover {
  background-color: var(--accent-hover);
}
</style>