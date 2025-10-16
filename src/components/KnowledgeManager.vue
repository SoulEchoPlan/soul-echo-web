<template>
  <div class="max-w-7xl mx-auto">
    <h1 class="text-3xl font-bold mb-2">角色知识库管理</h1>
    <p class="text-gray-400 mb-8">为你的 AI 角色上传、管理和同步知识，打造独特的对话体验。</p>

    <!-- 角色选择 -->
    <div class="mb-6">
      <label for="kb-character-select" class="block text-sm font-medium text-gray-300 mb-2">
        选择要管理的角色
      </label>
      <select
        v-model="selectedCharacterId"
        @change="onCharacterChange"
        class="w-full max-w-xs bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
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

    <div v-if="!selectedCharacterId" class="text-center py-12">
      <i data-lucide="book-open" class="h-16 w-16 text-gray-600 mx-auto mb-4"></i>
      <p class="text-gray-400 text-lg">请先选择一个角色</p>
      <p class="text-gray-500 text-sm mt-2">选择角色后可以管理其知识库</p>
    </div>

    <div v-else>
      <!-- 文件上传区域 -->
      <div
        class="bg-gray-800 rounded-lg p-6 border-2 border-dashed border-gray-700 hover:border-indigo-500 transition-colors mb-8"
        @dragover.prevent="handleDragOver"
        @dragleave.prevent="handleDragLeave"
        @drop.prevent="handleDrop"
        :class="{ 'border-indigo-500 bg-indigo-500/10': isDragging }"
      >
        <h2 class="text-xl font-semibold mb-4">上传新知识</h2>
        <div class="flex flex-col items-center justify-center text-center">
          <i data-lucide="upload-cloud" class="h-12 w-12 text-gray-500 mb-2"></i>
          <p class="text-gray-400 mb-4">
            {{ isDragging ? '释放文件到这里' : '拖拽���件到这里，或点击上传' }}
          </p>
          <p class="text-xs text-gray-500 mb-4">支持 TXT, PDF, MD 等格式</p>
          <input
            ref="fileInput"
            type="file"
            class="hidden"
            multiple
            accept=".txt,.pdf,.md,.doc,.docx"
            @change="handleFileSelect"
          >
          <button
            @click="$refs.fileInput.click()"
            :disabled="uploading"
            class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ uploading ? '上传中...' : '选择文件' }}
          </button>
        </div>

        <!-- 上传进度 -->
        <div v-if="uploadProgress.length > 0" class="mt-4 space-y-2">
          <div
            v-for="progress in uploadProgress"
            :key="progress.file"
            class="bg-gray-700 rounded-lg p-3"
          >
            <div class="flex justify-between items-center mb-1">
              <span class="text-sm text-gray-300 truncate">{{ progress.file }}</span>
              <span class="text-xs text-gray-400">{{ progress.percent }}%</span>
            </div>
            <div class="w-full bg-gray-600 rounded-full h-2">
              <div
                class="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: progress.percent + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 当前知识源 -->
      <div>
        <h2 class="text-xl font-semibold mb-4">当前知识源</h2>
        <div v-if="loading.knowledge" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>

        <div
          v-else-if="knowledgeFiles.length === 0"
          class="bg-gray-800 rounded-lg border border-gray-700 text-center py-12"
        >
          <i data-lucide="file-text" class="h-16 w-16 text-gray-600 mx-auto mb-4"></i>
          <p class="text-gray-400 text-lg">暂无知识文件</p>
          <p class="text-gray-500 text-sm mt-2">上传文件来为角色添加知识</p>
        </div>

        <div v-else class="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
          <table class="w-full text-left">
            <thead class="bg-gray-700/50">
              <tr>
                <th class="p-4 text-sm font-semibold">文件名</th>
                <th class="p-4 text-sm font-semibold">类型</th>
                <th class="p-4 text-sm font-semibold">大小</th>
                <th class="p-4 text-sm font-semibold">状态</th>
                <th class="p-4 text-sm font-semibold">上传时间</th>
                <th class="p-4 text-sm font-semibold text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="file in knowledgeFiles"
                :key="file.id"
                class="border-b border-gray-700 hover:bg-gray-700/30 transition-colors"
              >
                <td class="p-4">
                  <div class="flex items-center">
                    <i
                      :data-lucide="getFileIcon(file.type)"
                      class="h-5 w-5 text-gray-400 mr-3"
                    ></i>
                    <span class="font-medium">{{ file.name }}</span>
                  </div>
                </td>
                <td class="p-4">
                  <span :class="getFileTypeClass(file.type)" class="text-xs font-medium px-2 py-1 rounded-full">
                    {{ file.type.toUpperCase() }}
                  </span>
                </td>
                <td class="p-4 text-sm text-gray-400">{{ formatFileSize(file.size) }}</td>
                <td class="p-4">
                  <span :class="getStatusClass(file.status)" class="text-sm">
                    {{ getStatusText(file.status) }}
                  </span>
                </td>
                <td class="p-4 text-sm text-gray-400">{{ formatDate(file.createdAt) }}</td>
                <td class="p-4 text-right">
                  <button
                    @click="deleteKnowledgeFile(file)"
                    class="text-red-400 hover:text-red-300 transition-colors"
                    title="删除"
                  >
                    <i data-lucide="trash-2" class="h-5 w-5"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
      @click.self="cancelDelete"
    >
      <div class="bg-gray-800 rounded-lg shadow-xl w-full max-w-sm">
        <div class="p-6">
          <div class="flex items-center mb-4">
            <div class="flex-shrink-0">
              <i data-lucide="alert-triangle" class="h-6 w-6 text-red-400"></i>
            </div>
            <div class="ml-3">
              <h3 class="text-lg font-medium text-white">确认删除</h3>
              <p class="text-sm text-gray-400 mt-1">
                确定要删除文件 "{{ deleteTarget?.name }}" 吗？此操作无法撤销。
              </p>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button
              @click="cancelDelete"
              class="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition-colors"
            >
              取消
            </button>
            <button
              @click="confirmDelete"
              :disabled="deleting"
              class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ deleting ? '删除中...' : '删除' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 通知组件 -->
    <Notification ref="notification" />
  </div>
</template>

<script>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useCharacterStore } from '@/stores/character'
import Notification from '@/components/Notification.vue'
import { lucide } from 'lucide-vue-next'

export default {
  name: 'KnowledgeManager',
  components: {
    Notification
  },
  setup() {
    const characterStore = useCharacterStore()
    const notification = ref(null)
    const fileInput = ref(null)

    // 状态
    const characters = ref([])
    const selectedCharacterId = ref('')
    const knowledgeFiles = ref([])
    const isDragging = ref(false)
    const uploading = ref(false)
    const uploadProgress = ref([])
    const loading = reactive({
      knowledge: false
    })
    const deleting = ref(false)
    const showDeleteConfirm = ref(false)
    const deleteTarget = ref(null)

    // API基础URL
    const API_BASE_URL = 'http://localhost:8080/api'

    // 加载角色列表
    const loadCharacters = async () => {
      try {
        characters.value = await characterStore.fetchCharacters()
      } catch (error) {
        console.error('获取角色列表失败:', error)
        notification.value?.show('获取角色列表失败', 'error')
      }
    }

    // 加载知识文件
    const loadKnowledgeFiles = async (characterId) => {
      if (!characterId) return

      loading.knowledge = true
      try {
        const response = await fetch(`${API_BASE_URL}/characters/${characterId}/knowledge`)
        if (response.ok) {
          knowledgeFiles.value = await response.json()
        } else {
          throw new Error('获取知识文件失败')
        }
      } catch (error) {
        console.error('获取知识文件失败:', error)
        notification.value?.show('获取知识文件失败', 'error')
        knowledgeFiles.value = []
      } finally {
        loading.knowledge = false
      }
    }

    // 角色切换处理
    const onCharacterChange = () => {
      if (selectedCharacterId.value) {
        loadKnowledgeFiles(selectedCharacterId.value)
      } else {
        knowledgeFiles.value = []
      }
    }

    // 拖拽处理
    const handleDragOver = (event) => {
      event.dataTransfer.dropEffect = 'copy'
      isDragging.value = true
    }

    const handleDragLeave = () => {
      isDragging.value = false
    }

    const handleDrop = (event) => {
      isDragging.value = false
      const files = Array.from(event.dataTransfer.files)
      handleFiles(files)
    }

    // 文件选择处理
    const handleFileSelect = (event) => {
      const files = Array.from(event.target.files)
      handleFiles(files)
    }

    // 处理文件上传
    const handleFiles = async (files) => {
      if (!selectedCharacterId.value) {
        notification.value?.show('请先选择角色', 'warning')
        return
      }

      if (files.length === 0) return

      uploading.value = true
      uploadProgress.value = files.map(file => ({
        file: file.name,
        percent: 0
      }))

      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          await uploadFile(file, i)
        }

        notification.value?.show('文件上传成功', 'success')
        await loadKnowledgeFiles(selectedCharacterId.value)
      } catch (error) {
        console.error('文件上传失败:', error)
        notification.value?.show('文件上传失败', 'error')
      } finally {
        uploading.value = false
        uploadProgress.value = []
        if (fileInput.value) {
          fileInput.value.value = ''
        }
      }
    }

    // 上传单个文件
    const uploadFile = (file, index) => {
      return new Promise((resolve, reject) => {
        const formData = new FormData()
        formData.append('file', file)

        const xhr = new XMLHttpRequest()

        // 监听上传进度
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100)
            uploadProgress.value[index].percent = percent
          }
        })

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve()
          } else {
            reject(new Error(`上传失败: ${xhr.statusText}`))
          }
        })

        xhr.addEventListener('error', () => {
          reject(new Error('网络错误'))
        })

        xhr.open('POST', `${API_BASE_URL}/characters/${selectedCharacterId.value}/knowledge`)
        xhr.send(formData)
      })
    }

    // 删除知识文件
    const deleteKnowledgeFile = (file) => {
      deleteTarget.value = file
      showDeleteConfirm.value = true
    }

    // 确认删除
    const confirmDelete = async () => {
      if (!deleteTarget.value) return

      deleting.value = true
      try {
        const response = await fetch(
          `${API_BASE_URL}/characters/${selectedCharacterId.value}/knowledge/${deleteTarget.value.id}`,
          { method: 'DELETE' }
        )

        if (response.ok) {
          notification.value?.show('文件删除成功', 'success')
          await loadKnowledgeFiles(selectedCharacterId.value)
          cancelDelete()
        } else {
          throw new Error('删除失败')
        }
      } catch (error) {
        console.error('删除文件失败:', error)
        notification.value?.show('删除文件失败', 'error')
      } finally {
        deleting.value = false
      }
    }

    // 取消删除
    const cancelDelete = () => {
      showDeleteConfirm.value = false
      deleteTarget.value = null
    }

    // 获取文件图标
    const getFileIcon = (fileType) => {
      const iconMap = {
        'pdf': 'file-text',
        'txt': 'file-text',
        'md': 'file-text',
        'doc': 'file-text',
        'docx': 'file-text'
      }
      return iconMap[fileType.toLowerCase()] || 'file'
    }

    // 获取文件类型样式
    const getFileTypeClass = (fileType) => {
      const classMap = {
        'pdf': 'bg-blue-900/50 text-blue-300',
        'txt': 'bg-green-900/50 text-green-300',
        'md': 'bg-purple-900/50 text-purple-300',
        'doc': 'bg-orange-900/50 text-orange-300',
        'docx': 'bg-orange-900/50 text-orange-300'
      }
      return classMap[fileType.toLowerCase()] || 'bg-gray-900/50 text-gray-300'
    }

    // 获取状态样式
    const getStatusClass = (status) => {
      const classMap = {
        'indexed': 'text-green-400',
        'processing': 'text-yellow-400',
        'failed': 'text-red-400'
      }
      return classMap[status] || 'text-gray-400'
    }

    // 获取状态文本
    const getStatusText = (status) => {
      const textMap = {
        'indexed': '已索引',
        'processing': '处理中',
        'failed': '索引失败'
      }
      return textMap[status] || '未知'
    }

    // 格式化文件大小
    const formatFileSize = (bytes) => {
      if (!bytes) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    onMounted(async () => {
      await loadCharacters()

      // 初始化Lucide图标
      nextTick(() => {
        lucide.createIcons()
      })
    })

    return {
      // 状态
      characters,
      selectedCharacterId,
      knowledgeFiles,
      isDragging,
      uploading,
      uploadProgress,
      loading,
      deleting,
      showDeleteConfirm,
      deleteTarget,

      // 引用
      fileInput,
      notification,

      // 方法
      onCharacterChange,
      handleDragOver,
      handleDragLeave,
      handleDrop,
      handleFileSelect,
      deleteKnowledgeFile,
      confirmDelete,
      cancelDelete,
      getFileIcon,
      getFileTypeClass,
      getStatusClass,
      getStatusText,
      formatFileSize,
      formatDate
    }
  }
}
</script>

<style scoped>
/* 拖拽区域样式 */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* 表格悬停效果 */
.hover\:bg-gray-700\/30:hover {
  background-color: rgba(55, 65, 81, 0.3);
}

/* 进度条动画 */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

/* 文件类型标签样式 */
.rounded-full {
  border-radius: 9999px;
}

/* 确保模态框内容不会溢出 */
.max-w-sm {
  max-width: 24rem;
}
</style>