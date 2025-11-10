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

