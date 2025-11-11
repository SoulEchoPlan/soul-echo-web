<template>
  <div id="page-cm" class="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold mb-2">角色管理</h1>
          <p class="text-gray-400">创建、编辑和管理你的 AI 角色。</p>
        </div>
        <button
          @click="openCreateModal"
          class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"
        >
          <Plus class="h-5 w-5" />
          创建新角色
        </button>
      </div>

      <!-- 角色列表 -->
      <div class="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
        <div v-if="loading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>

        <div v-else-if="characters.length === 0" class="text-center py-12">
          <Users class="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <p class="text-gray-400 text-lg">暂无角色</p>
          <p class="text-gray-500 text-sm mt-2">点击上方按钮创建第一个角色</p>
        </div>

        <table v-else class="w-full text-left">
          <thead class="bg-gray-700/50">
            <tr>
              <th class="p-4 text-sm font-semibold">头像</th>
              <th class="p-4 text-sm font-semibold">角色名称</th>
              <th class="p-4 text-sm font-semibold">描述</th>
              <th class="p-4 text-sm font-semibold text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="character in characters"
              :key="character.id"
              class="border-b border-gray-700"
            >
              <td class="p-4">
                <img
                  :src="character.avatarUrl"
                  :alt="character.name"
                  class="w-10 h-10 rounded-full object-cover"
                  @error="handleImageError"
                >
              </td>
              <td class="p-4 font-medium">{{ character.name }}</td>
              <td class="p-4 text-sm text-gray-400 max-w-sm truncate">{{ character.personaPrompt }}</td>
              <td class="p-4 text-right flex gap-4 justify-end">
                <button
                  @click="openEditModal(character)"
                  class="text-blue-400 hover:text-blue-300 edit-btn"
                >
                  <Edit class="h-5 w-5" />
                </button>
                <button
                  @click="deleteCharacter(character)"
                  class="text-red-400 hover:text-red-300 delete-btn"
                >
                  <Trash2 class="h-5 w-5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 创建/编辑角色 Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
      @click.self="closeModal"
    >
      <div class="bg-gray-800 rounded-lg shadow-xl w-full max-w-md transform transition-all">
        <form @submit.prevent="handleSubmit">
          <div class="p-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-bold">
                {{ isEditing ? '编辑角色' : '创建新角色' }}
              </h2>
              <button
                type="button"
                @click="closeModal"
                class="text-gray-400 hover:text-white"
              >
                <X class="h-6 w-6" />
              </button>
            </div>

            <div class="space-y-4">
              <div>
                <label for="character-name" class="block text-sm font-medium text-gray-300 mb-1">
                  角色名称
                </label>
                <input
                  v-model="formData.name"
                  type="text"
                  id="character-name"
                  placeholder="例如：福尔摩斯"
                  required
                  class="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
              </div>

              <div>
                <label for="character-description" class="block text-sm font-medium text-gray-300 mb-1">
                  角色设定 (Persona)
                </label>
                <textarea
                  v-model="formData.personaPrompt"
                  id="character-description"
                  rows="4"
                  placeholder="详细描述角色的性格、背景、说话风格等..."
                  required
                  class="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div>
                <label for="character-avatar-url" class="block text-sm font-medium text-gray-300 mb-1">
                  头像 URL
                </label>
                <input
                  v-model="formData.avatarUrl"
                  type="url"
                  id="character-avatar-url"
                  placeholder="https://..."
                  required
                  class="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
              </div>
            </div>
          </div>

          <div class="bg-gray-700/50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
            <button
              type="button"
              @click="closeModal"
              class="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50"
            >
              {{ submitting ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus, Users, Edit, Trash2, X } from 'lucide-vue-next'

// 响应式数据
const characters = ref([])
const loading = ref(false)
const submitting = ref(false)
const showModal = ref(false)
const isEditing = ref(false)
const editingCharacter = ref(null)

// 表单数据
const formData = reactive({
  name: '',
  personaPrompt: '',
  avatarUrl: ''
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

// 打开创建模态框
const openCreateModal = () => {
  isEditing.value = false
  resetForm()
  showModal.value = true
}

// 打开编辑模态框
const openEditModal = (character) => {
  isEditing.value = true
  editingCharacter.value = character
  formData.name = character.name
  formData.personaPrompt = character.personaPrompt
  formData.avatarUrl = character.avatarUrl
  showModal.value = true
}

// 关闭模态框
const closeModal = () => {
  showModal.value = false
  resetForm()
  editingCharacter.value = null
}

// 重置表单
const resetForm = () => {
  formData.name = ''
  formData.personaPrompt = ''
  formData.avatarUrl = ''
}

// 处理表单提交
const handleSubmit = async () => {
  submitting.value = true
  try {
    let response
    const requestData = {
      name: formData.name,
      personaPrompt: formData.personaPrompt,
      avatarUrl: formData.avatarUrl
    }

    if (isEditing.value) {
      // 更新角色
      response = await fetch(`${API_BASE_URL}/characters/${editingCharacter.value.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })
    } else {
      // 创建角色
      response = await fetch(`${API_BASE_URL}/characters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })
    }

    if (response.ok) {
      window.showNotification(
        isEditing.value ? '角色更新成功' : '角色创建成功',
        'success'
      )
      await fetchCharacters()
      closeModal()
    } else {
      const errorData = await response.json()
      window.showNotification(errorData.message || '操作失败', 'error')
    }
  } catch (error) {
    console.error('保存角色失败:', error)
    window.showNotification('保存角色失败', 'error')
  } finally {
    submitting.value = false
  }
}

// 删除角色
const deleteCharacter = async (character) => {
  if (!confirm(`确定要删除角色 "${character.name}" 吗？此操作无法撤销。`)) {
    return
  }

  try {
    const response = await fetch(`${API_BASE_URL}/characters/${character.id}`, {
      method: 'DELETE'
    })

    if (response.ok) {
      window.showNotification('角色删除成功', 'success')
      await fetchCharacters()
    } else {
      window.showNotification('删除角色失败', 'error')
    }
  } catch (error) {
    console.error('删除角色失败:', error)
    window.showNotification('删除角色失败', 'error')
  }
}

// 处理图片加载错误
const handleImageError = (event) => {
  const name = event.target.alt || 'Avatar'
  event.target.src = `https://placehold.co/40x40/4b5563/E2E8F0?text=${encodeURIComponent(name)}`
}

// 组件挂载时获取角色列表
onMounted(() => {
  fetchCharacters()
})
</script>