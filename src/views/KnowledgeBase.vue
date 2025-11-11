<template>
  <div id="page-kb" class="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl font-bold mb-2">角色知识库管理</h1>
      <p class="text-gray-400 mb-8">为你的 AI 角色上传、管理和同步知识，打造独特的对话体验。</p>

      <div class="mb-6">
        <label for="kb-character-select" class="block text-sm font-medium text-gray-300 mb-2">选择要管理的角色</label>
        <select
          id="kb-character-select"
          v-model="selectedCharacterId"
          class="w-full max-w-xs bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="" disabled>请选择角色</option>
          <option
            v-for="character in characters"
            :key="character.id"
            :value="character.id"
          >
            {{ character.name }}
          </option>
        </select>
      </div>

      <div class="bg-gray-800 rounded-lg p-6 border-2 border-dashed border-gray-700 hover:border-indigo-500 transition-colors">
        <h2 class="text-xl font-semibold mb-4">上传新知识</h2>
        <div class="flex flex-col items-center justify-center text-center">
          <UploadCloud class="h-12 w-12 text-gray-500 mb-2" />
          <p class="text-gray-400 mb-4">拖拽文件到这里，或点击上传</p>
          <p class="text-xs text-gray-500 mb-4">支持 TXT, PDF, MD 等格式</p>
          <input
            type="file"
            class="hidden"
            id="file-upload"
            multiple
            accept=".txt,.pdf,.md,.doc,.docx"
            @change="handleFileSelect"
          >
          <button
            @click="$refs.fileInput?.click()"
            class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            选择文件
          </button>
          <input
            ref="fileInput"
            type="file"
            class="hidden"
            multiple
            accept=".txt,.pdf,.md,.doc,.docx"
            @change="handleFileSelect"
          >
        </div>
      </div>

      <div class="mt-8">
        <h2 class="text-xl font-semibold mb-4">当前知识源</h2>
        <div class="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
          <table class="w-full text-left">
            <thead class="bg-gray-700/50">
              <tr>
                <th class="p-4 text-sm font-semibold">文件名</th>
                <th class="p-4 text-sm font-semibold">类型</th>
                <th class="p-4 text-sm font-semibold">状态</th>
                <th class="p-4 text-sm font-semibold text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b border-gray-700">
                <td class="p-4">魔法史.pdf</td>
                <td class="p-4">
                  <span class="bg-blue-900/50 text-blue-300 text-xs font-medium px-2 py-1 rounded-full">PDF</span>
                </td>
                <td class="p-4">
                  <span class="text-green-400">已索引</span>
                </td>
                <td class="p-4 text-right">
                  <button class="text-red-400 hover:text-red-300">
                    <Trash2 class="h-5 w-5" />
                  </button>
                </td>
              </tr>
              <tr class="border-b border-gray-700">
                <td class="p-4">霍格沃茨：一段校史.txt</td>
                <td class="p-4">
                  <span class="bg-green-900/50 text-green-300 text-xs font-medium px-2 py-1 rounded-full">TXT</span>
                </td>
                <td class="p-4">
                  <span class="text-green-400">已索引</span>
                </td>
                <td class="p-4 text-right">
                  <button class="text-red-400 hover:text-red-300">
                    <Trash2 class="h-5 w-5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { UploadCloud, Trash2 } from 'lucide-vue-next'

// 响应式数据
const characters = ref([])
const selectedCharacterId = ref('')
const fileInput = ref(null)

// API 基础 URL
const API_BASE_URL = 'http://localhost:8080/api'

// 获取角色列表
const fetchCharacters = async () => {
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
  }
}

// 处理文件选择
const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  if (files.length > 0) {
    // 这里暂时只显示提示，不实现上传逻辑
    window.showNotification(`已选择 ${files.length} 个文件（暂未实现上传）`, 'warning')
  }
}

// 组件挂载时获取角色列表
onMounted(() => {
  fetchCharacters()
})
</script>