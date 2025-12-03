<template>
  <div class="knowledge-base-container">
    <div class="kb-content">
      <!-- 页面标题和描述 -->
      <div class="kb-header">
        <h1 class="kb-title">角色知识库管理</h1>
        <p class="kb-description">为你的 AI 角色上传、管理和同步知识，打造独特的对话体验。</p>
      </div>

      <!-- 角色选择 -->
      <div class="character-selector">
        <label for="kb-character-select" class="selector-label">选择要管理的角色</label>
        <select
          id="kb-character-select"
          v-model="selectedCharacterId"
          @change="handleCharacterChange"
          class="character-select"
        >
          <option
            v-for="character in characterStore.characters"
            :key="character.id"
            :value="character.id"
          >
            {{ character.name }}
          </option>
        </select>
      </div>

      <!-- 文件上传区域 -->
      <div
        class="upload-area"
        :class="{ 'drag-over': isDragOver }"
        @drop="handleDrop"
        @dragover.prevent="isDragOver = true"
        @dragleave="isDragOver = false"
        @click="triggerFileSelect"
      >
        <div class="upload-content">
          <UploadCloud class="upload-icon" />
          <p class="upload-text">拖拽文件到这里，或点击上传</p>
          <p class="upload-hint">支持 TXT, PDF, MD 等格式</p>
          <input
            ref="fileInput"
            type="file"
            class="file-input"
            @change="handleFileSelect"
            accept=".txt,.pdf,.md,.docx"
          >
          <button
            @click.stop="triggerFileSelect"
            class="upload-button"
          >
            选择文件
          </button>
        </div>
      </div>

      <!-- 文件列表 -->
      <div class="file-list-section">
        <h2 class="section-title">当前知识源</h2>
        <div class="file-table-container">
          <table class="file-table">
            <thead class="table-header">
              <tr>
                <th class="header-cell">文件名</th>
                <th class="header-cell">类型</th>
                <th class="header-cell">状态</th>
                <th class="header-cell text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="file in knowledgeFiles"
                :key="file.id"
                class="table-row"
              >
                <td class="row-cell">{{ file.fileName }}</td>
                <td class="row-cell">
                  <span
                    :class="getFileBadgeClass(file.fileName)"
                    class="file-badge"
                  >
                    {{ getFileType(file.fileName) }}
                  </span>
                </td>
                <td class="row-cell">
                  <span
                    :class="getStatusBadgeClass(file.status)"
                    class="status-badge"
                  >
                    {{ getStatusText(file.status) }}
                  </span>
                </td>
                <td class="row-cell text-right">
                  <button
                    @click="deleteFile(file.id)"
                    class="delete-button"
                  >
                    <Trash2 class="delete-icon" />
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
import { ref, onMounted, watch, nextTick } from 'vue'
import { useCharacterStore } from '@/stores/character'
import { api } from '@/services/api'
import { UploadCloud, Trash2 } from 'lucide-vue-next'

const characterStore = useCharacterStore()

// 响应式数据
const selectedCharacterId = ref(characterStore.activeCharacterId)
const knowledgeFiles = ref([])
const isDragOver = ref(false)
const fileInput = ref(null)

// 获取文件类型徽章样式
const getFileBadgeClass = (fileName) => {
  const ext = fileName.split('.').pop().toLowerCase()
  const baseClass = 'file-badge'

  switch (ext) {
    case 'pdf':
      return `${baseClass} pdf-badge`
    case 'txt':
      return `${baseClass} txt-badge`
    case 'md':
      return `${baseClass} md-badge`
    case 'docx':
      return `${baseClass} docx-badge`
    default:
      return `${baseClass} default-badge`
  }
}

// 获取文件类型显示文本
const getFileType = (fileName) => {
  return fileName.split('.').pop().toUpperCase()
}

// 获取状态徽章样式
const getStatusBadgeClass = (status) => {
  const baseClass = 'status-badge'

  switch (status) {
    case 'INDEXING':
      return `${baseClass} indexing-status`
    case 'ACTIVE':
      return `${baseClass} active-status`
    case 'FAILED':
      return `${baseClass} failed-status`
    default:
      return `${baseClass} unknown-status`
  }
}

// 获取状态显示文本
const getStatusText = (status) => {
  switch (status) {
    case 'INDEXING':
      return '索引中'
    case 'ACTIVE':
      return '已启用'
    case 'FAILED':
      return '失败'
    default:
      return '未知'
  }
}

// 触发文件选择
const triggerFileSelect = () => {
  fileInput.value?.click()
}

// 处理文件选择
const handleFileSelect = (event) => {
  const files = event.target.files
  if (files.length > 0) {
    handleFileUpload(files[0])
  }
}

// 处理拖拽释放
const handleDrop = (event) => {
  event.preventDefault()
  isDragOver.value = false

  const files = event.dataTransfer.files
  if (files.length > 0) {
    handleFileUpload(files[0])
  }
}

// 处理文件上传
const handleFileUpload = async (file) => {
  if (!selectedCharacterId.value) {
    console.error('请先选择角色')
    return
  }

  try {
    await api.uploadKnowledgeFile(file, selectedCharacterId.value)
    console.log('文件上传成功')
    await fetchKnowledgeFiles()
  } catch (error) {
    console.error('文件上传失败:', error)
  }
}

// 删除文件
const deleteFile = async (fileId) => {
  if (!confirm('确定要删除这个知识文件吗？')) {
    return
  }

  try {
    await api.deleteKnowledgeFile(fileId)
    console.log('文件删除成功')
    await fetchKnowledgeFiles()
  } catch (error) {
    console.error('文件删除失败:', error)
  }
}

// 获取知识文件列表
const fetchKnowledgeFiles = async () => {
  if (!selectedCharacterId.value) {
    knowledgeFiles.value = []
    return
  }

  try {
    const files = await api.getCharacterKnowledge(selectedCharacterId.value)
    knowledgeFiles.value = files
  } catch (error) {
    console.error('获取知识文件列表失败:', error)
    knowledgeFiles.value = []
  }
}

// 处理角色切换
const handleCharacterChange = async () => {
  characterStore.setActiveCharacter(selectedCharacterId.value)
  await fetchKnowledgeFiles()
}

// 监听角色ID变化
watch(() => characterStore.activeCharacterId, async (newId) => {
  if (newId !== selectedCharacterId.value) {
    selectedCharacterId.value = newId
    await fetchKnowledgeFiles()
  }
})

// 组件挂载
onMounted(async () => {
  // 确保角色数据已加载
  if (characterStore.characters.length === 0) {
    await characterStore.fetchCharacters()
  }

  // 设置当前选中的角色
  if (characterStore.activeCharacterId) {
    selectedCharacterId.value = characterStore.activeCharacterId
    await fetchKnowledgeFiles()
  }
})
</script>

<style scoped>
/* 主容器 */
.knowledge-base-container {
  padding: 1rem 2rem;
  height: 100%;
  overflow-y: auto;
}

.kb-content {
  max-width: 1280px;
  margin: 0 auto;
}

/* 页面标题区域 */
.kb-header {
  margin-bottom: 2rem;
}

.kb-title {
  font-size: 1.875rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.kb-description {
  color: var(--text-muted);
  margin-bottom: 0;
}

/* 角色选择器 */
.character-selector {
  margin-bottom: 1.5rem;
}

.selector-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.character-select {
  width: 100%;
  max-width: 320px;
  background-color: var(--panel-bg);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  color: var(--text-color);
  font-size: 0.875rem;
}

.character-select:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

/* 上传区域 */
.upload-area {
  background-color: var(--panel-bg);
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 2px dashed var(--border-color);
  transition: border-color 0.3s ease;
  cursor: pointer;
  margin-bottom: 2rem;
}

.upload-area:hover,
.upload-area.drag-over {
  border-color: var(--accent-color);
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.upload-icon {
  width: 3rem;
  height: 3rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.upload-text {
  color: var(--text-muted);
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
}

.upload-hint {
  color: var(--text-muted);
  font-size: 0.75rem;
  opacity: 0.7;
  margin-bottom: 1rem;
}

.file-input {
  display: none;
}

.upload-button {
  background-color: var(--accent-color);
  color: white;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: background-color 0.2s ease;
}

.upload-button:hover {
  background-color: var(--accent-hover);
}

/* 文件列表区域 */
.file-list-section {
  margin-top: 2rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-color);
}

.file-table-container {
  background-color: var(--panel-bg);
  border-radius: 0.75rem;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.file-table {
  width: 100%;
  text-align: left;
  border-collapse: collapse;
}

.table-header {
  background-color: var(--secondary-bg);
}

.header-cell {
  padding: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-color);
  border-bottom: 1px solid var(--border-color);
}

.row-cell {
  padding: 1rem;
  font-size: 0.875rem;
  color: var(--text-color);
  border-bottom: 1px solid var(--border-color);
}

.table-row:last-child .row-cell {
  border-bottom: none;
}

.text-right {
  text-align: right;
}

/* 文件类型徽章 */
.file-badge {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
}

.pdf-badge {
  background-color: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.txt-badge {
  background-color: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.md-badge {
  background-color: rgba(168, 85, 247, 0.2);
  color: #a855f7;
}

.docx-badge {
  background-color: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.default-badge {
  background-color: rgba(107, 114, 128, 0.2);
  color: #6b7280;
}

/* 状态徽章 */
.status-badge {
  font-size: 0.875rem;
  font-weight: 500;
}

.indexing-status {
  color: #f59e0b;
}

.active-status {
  color: #22c55e;
}

.failed-status {
  color: #ef4444;
}

.unknown-status {
  color: #6b7280;
}

/* 删除按钮 */
.delete-button {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: color 0.2s ease;
}

.delete-button:hover {
  color: #dc2626;
}

.delete-icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .knowledge-base-container {
    padding: 1rem;
  }

  .file-table {
    font-size: 0.75rem;
  }

  .header-cell,
  .row-cell {
    padding: 0.75rem 0.5rem;
  }

  .character-select {
    max-width: 100%;
  }
}
</style>