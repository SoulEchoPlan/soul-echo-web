<template>
  <div id="character-selection" class="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl font-bold mb-2">选择你的聊天伙伴</h1>
      <p class="text-gray-400 mb-6">搜索或选择一个角色，开始一段沉浸式语音对话。</p>

      <!-- 搜索框 -->
      <div class="mb-8">
        <div class="relative">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search class="h-5 w-5 text-gray-400" />
          </span>
          <input
            v-model="searchQuery"
            type="search"
            placeholder="搜索角色，例如：哈利波特"
            class="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
        </div>
      </div>

      <!-- 角色卡片列表 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div
          v-for="character in filteredCharacters"
          :key="character.id"
          @click="selectCharacter(character)"
          class="character-card bg-gray-800 rounded-lg overflow-hidden cursor-pointer"
        >
          <img
            :src="character.avatarUrl"
            :alt="character.name"
            class="w-full h-48 object-cover"
            @error="handleImageError"
          >
          <div class="p-4">
            <h3 class="text-lg font-semibold">{{ character.name }}</h3>
            <p class="text-sm text-gray-400 mt-1">{{ character.personaPrompt }}</p>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && filteredCharacters.length === 0" class="text-center py-12">
        <Users class="h-16 w-16 text-gray-600 mx-auto mb-4" />
        <p class="text-gray-400 text-lg">暂无角色</p>
        <p class="text-gray-500 text-sm mt-2">请先创建一些角色</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, Users } from 'lucide-vue-next'

// 定义发射事件
const emit = defineEmits(['character-selected'])

// 响应式数据
const characters = ref([])
const searchQuery = ref('')
const loading = ref(false)

// 计算属性：过滤后的角色列表
const filteredCharacters = computed(() => {
  if (!searchQuery.value.trim()) {
    return characters.value
  }
  const query = searchQuery.value.toLowerCase()
  return characters.value.filter(character =>
    character.name.toLowerCase().includes(query) ||
    character.personaPrompt.toLowerCase().includes(query)
  )
})

// API 基础 URL
const API_BASE_URL = 'http://localhost:8080/api'

// 获取角色列表
const fetchCharacters = async () => {
  loading.value = true
  try {
    const response = await fetch(`${API_BASE_URL}/characters`)
    if (response.ok) {
      characters.value = await response.json()
    } else {
      console.error('获取角色列表失败:', response.statusText)
      window.showNotification('获取角色列表失败', 'error')
    }
  } catch (error) {
    console.error('获取角色列表失败:', error)
    window.showNotification('获取角色列表失败', 'error')
  } finally {
    loading.value = false
  }
}

// 选择角色
const selectCharacter = (character) => {
  emit('character-selected', character)
}

// 处理图片加载错误
const handleImageError = (event) => {
  const name = event.target.alt || 'Avatar'
  event.target.src = `https://placehold.co/400x400/4b5563/E2E8F0?text=${encodeURIComponent(name)}`
}

// 组件挂载时获取角色列表
onMounted(() => {
  fetchCharacters()
})
</script>