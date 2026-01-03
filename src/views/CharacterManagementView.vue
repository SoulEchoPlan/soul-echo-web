<template>
  <div class="character-management">
    <!-- 顶部栏：标题 + 创建按钮 -->
    <div class="page-header">
      <div>
        <h1 class="page-title">角色管理</h1>
        <p class="page-subtitle">创建、编辑和管理你的 AI 角色。</p>
      </div>
      <button class="create-btn" @click="openModal(false)">
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        创建新角色
      </button>
    </div>

    <!-- 搜索栏 -->
    <div class="search-section">
      <div class="search-input-container">
        <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"></path>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索角色名称..."
          class="search-input"
        />
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="characterStore.isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>正在加载角色数据...</p>
    </div>

    <!-- 空状态 -->
    <div v-else-if="filteredCharacters.length === 0" class="empty-state">
      <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"></path>
      </svg>
      <h3>{{ searchQuery ? '没有找到匹配的角色' : '还没有创建任何角色' }}</h3>
      <p>{{ searchQuery ? '请尝试其他搜索关键词' : '点击上方的"创建新角色"按钮开始创建你的第一个 AI 角色' }}</p>
    </div>

    <!-- 角色表格 -->
    <div v-else class="table-container">
      <table class="character-table">
        <thead>
          <tr>
            <th>角色名称</th>
            <th>角色设定 (描述)</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="character in filteredCharacters" :key="character.id" class="character-row">
            <td class="character-name">{{ character.name }}</td>
            <td class="character-description">
              <span class="description-text">{{ character.personaPrompt }}</span>
            </td>
            <td class="character-actions">
              <button
                class="action-btn edit-btn"
                @click="openModal(true, character)"
                title="编辑角色"
              >
                <svg class="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"></path>
                </svg>
              </button>
              <button
                class="action-btn delete-btn"
                @click="confirmDelete(character)"
                title="删除角色"
              >
                <svg class="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"></path>
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 创建/编辑模态框 -->
    <div
      v-if="showModal"
      class="modal-overlay"
      @click.self="closeModal"
    >
      <div class="modal-container">
        <form @submit.prevent="handleSubmit" class="character-form">
          <div class="modal-header">
            <h2 class="modal-title">{{ isEditing ? '编辑角色' : '创建新角色' }}</h2>
            <button type="button" class="close-btn" @click="closeModal">
              <svg class="close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label for="name" class="form-label">角色名称</label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                required
                placeholder="例如：福尔摩斯"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="personaPrompt" class="form-label">角色设定 (Persona)</label>
              <textarea
                id="personaPrompt"
                v-model="form.personaPrompt"
                rows="4"
                required
                placeholder="详细描述角色的性格、背景、说话风格等..."
                class="form-textarea"
              ></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-cancel" @click="closeModal">
              取消
            </button>
            <button type="submit" class="btn-submit" :disabled="isSubmitting">
              {{ isSubmitting ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useCharacterStore } from '@/stores/character'

// Store
const characterStore = useCharacterStore()

// 响应式数据
const searchQuery = ref('')
const showModal = ref(false)
const isEditing = ref(false)
const isSubmitting = ref(false)
const editingCharacter = ref(null)

// 表单数据
const form = ref({
  name: '',
  personaPrompt: ''
})

// 计算属性 - 过滤后的角色列表
const filteredCharacters = computed(() => {
  if (!searchQuery.value) {
    return characterStore.characters
  }
  const term = searchQuery.value.toLowerCase()
  return characterStore.characters.filter(character =>
    character.name.toLowerCase().includes(term)
  )
})

// 生成头像URL
const generateAvatarUrl = (name) => {
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`
}

// 打开模态框
const openModal = (edit = false, character = null) => {
  isEditing.value = edit
  editingCharacter.value = character

  if (edit && character) {
    // 编辑模式：填充表单
    form.value.name = character.name
    form.value.personaPrompt = character.personaPrompt
  } else {
    // 创建模式：重置表单
    form.value.name = ''
    form.value.personaPrompt = ''
  }

  showModal.value = true
}

// 关闭模态框
const closeModal = () => {
  showModal.value = false
  isEditing.value = false
  editingCharacter.value = null
  form.value.name = ''
  form.value.personaPrompt = ''
}

// 处理表单提交
const handleSubmit = async () => {
  if (isSubmitting.value) return

  isSubmitting.value = true

  try {
    // 生成头像URL
    const avatarUrl = generateAvatarUrl(form.value.name)

    // 构建角色数据对象
    const characterData = {
      name: form.value.name,
      personaPrompt: form.value.personaPrompt,
      avatarUrl: avatarUrl,
      voiceId: '', // 使用默认语音ID
      isPublic: false // 默认为私有角色
    }

    if (isEditing.value && editingCharacter.value) {
      // 更新角色
      await characterStore.updateCharacter(editingCharacter.value.id, characterData)
      showNotification('角色更新成功！')
    } else {
      // 创建角色
      await characterStore.addCharacter(characterData)
      showNotification('角色创建成功！')
    }

    closeModal()
  } catch (error) {
    console.error('保存角色失败:', error)
    showNotification('操作失败，请重试', 'error')
  } finally {
    isSubmitting.value = false
  }
}

// 确认删除角色
const confirmDelete = (character) => {
  if (confirm(`确定要删除角色 "${character.name}" 吗？此操作不可恢复。`)) {
    deleteCharacter(character.id)
  }
}

// 删除角色
const deleteCharacter = async (id) => {
  try {
    await characterStore.deleteCharacter(id)
    showNotification('角色删除成功！')
  } catch (error) {
    console.error('删除角色失败:', error)
    showNotification('删除失败，请重试', 'error')
  }
}

// 显示通知
const showNotification = (message, type = 'success') => {
  // 简单的通知实现，可以后续优化为更好的通知组件
  const notification = document.createElement('div')
  notification.className = `notification notification-${type}`
  notification.textContent = message
  notification.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.9);
    padding: 16px 24px;
    border-radius: 12px;
    color: white;
    font-weight: 500;
    z-index: 9999;
    transition: all 0.3s ease;
    opacity: 0;
    background-color: ${type === 'success' ? '#10b981' : '#ef4444'};
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    text-align: center;
    min-width: 200px;
  `

  document.body.appendChild(notification)

  // 触发动画
  setTimeout(() => {
    notification.style.opacity = '1'
    notification.style.transform = 'translate(-50%, -50%) scale(1)'
  }, 10)

  // 3秒后移除
  setTimeout(() => {
    notification.style.opacity = '0'
    notification.style.transform = 'translate(-50%, -50%) scale(0.9)'
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 300)
  }, 3000)
}

// 组件挂载时获取角色数据
onMounted(async () => {
  await characterStore.fetchCharacters()
})
</script>

<style scoped>
.character-management {
  width: 100%;
  max-width: 100%;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 100%;
  overflow-y: auto;
}

/* 顶部栏样式 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--text-color);
  margin: 0;
}

.page-subtitle {
  color: var(--text-muted);
  margin: 0.5rem 0 0 0;
  font-size: 0.875rem;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--accent-color);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
  white-space: nowrap;
}

.create-btn:hover {
  background-color: var(--accent-hover);
  transform: translateY(-1px);
}

.create-btn:active {
  transform: translateY(0);
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* 搜索区域样式 */
.search-section {
  margin-bottom: 1rem;
}

.search-input-container {
  position: relative;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: var(--text-muted);
}

.search-input {
  width: 100%;
  background-color: var(--panel-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  font-size: 0.875rem;
  color: var(--text-color);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.search-input:focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
  outline: none;
}

.search-input::placeholder {
  color: var(--text-muted);
}

/* 加载和空状态样式 */
.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  background-color: var(--panel-bg);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  min-height: 300px;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--accent-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-icon {
  width: 3rem;
  height: 3rem;
  color: var(--text-muted);
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: var(--text-color);
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.empty-state p {
  color: var(--text-muted);
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
}

/* 表格容器样式 */
.table-container {
  background-color: var(--panel-bg);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  overflow: hidden;
  flex: 1;
  min-height: 0;
}

.character-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.character-table th {
  background-color: var(--secondary-bg);
  color: var(--text-color);
  font-weight: 600;
  text-align: left;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  white-space: nowrap;
}

.character-row {
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.2s ease;
}

.character-row:last-child {
  border-bottom: none;
}

.character-row:hover {
  background-color: var(--secondary-bg);
}

.character-table td {
  padding: 1rem;
  color: var(--text-color);
  vertical-align: top;
}

.character-name {
  font-weight: 600;
  color: var(--text-color);
}

.character-description {
  max-width: 0; /* 让表格宽度自适应 */
}

.description-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.5;
  color: var(--text-muted);
  font-size: 0.813rem;
}

.character-actions {
  display: flex;
  gap: 0.5rem;
  white-space: nowrap;
  width: 80px; /* 固定宽度保证对齐 */
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: transparent;
}

.action-icon {
  width: 1rem;
  height: 1rem;
}

/* 编辑按钮：默认蓝色 */
.edit-btn {
  color: #3b82f6;
  opacity: 0.7;
}

.edit-btn:hover {
  opacity: 1;
  background-color: rgba(59, 130, 246, 0.1);
}

.edit-btn:active {
  opacity: 1;
  filter: brightness(1.2);
}

/* 删除按钮：默认红色 */
.delete-btn {
  color: #ef4444;
  opacity: 0.7;
}

.delete-btn:hover {
  opacity: 1;
  background-color: rgba(239, 68, 68, 0.1);
}

.delete-btn:active {
  opacity: 1;
  filter: brightness(1.2);
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-container {
  background-color: var(--panel-bg);
  border-radius: 12px;
  box-shadow: var(--shadow);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.character-form {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  background-color: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: var(--text-muted);
  transition: all 0.2s ease;
  padding: 0;
}

.close-btn:hover {
  background-color: var(--secondary-bg);
  color: var(--text-color);
}

.close-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--text-color);
}

.form-input, .form-textarea {
  width: 100%;
  background-color: var(--secondary-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.75rem;
  font-size: 0.875rem;
  color: var(--text-color);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  resize: vertical;
  font-family: inherit;
}

.form-input:focus, .form-textarea:focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
  outline: none;
}

.form-input::placeholder, .form-textarea::placeholder {
  color: var(--text-muted);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem 1.5rem;
  border-top: 1px solid var(--border-color);
}

.btn-cancel, .btn-submit {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-cancel {
  background-color: var(--secondary-bg);
  color: var(--text-color);
  border: 1px solid var(--border-color);
}

.btn-cancel:hover {
  background-color: var(--border-color);
}

.btn-submit {
  background-color: var(--accent-color);
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background-color: var(--accent-hover);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .character-management {
    padding: 0.75rem;
    gap: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .create-btn {
    justify-content: center;
  }

  .search-input-container {
    max-width: none;
  }

  .modal-overlay {
    padding: 0.5rem;
  }

  .modal-container {
    max-width: none;
    margin: 0.5rem;
  }

  .modal-header {
    padding: 1rem 1rem 0.75rem;
  }

  .modal-body {
    padding: 1rem;
  }

  .modal-footer {
    padding: 0.75rem 1rem 1rem;
  }

  .character-table th,
  .character-table td {
    padding: 0.75rem 0.5rem;
    font-size: 0.813rem;
  }

  .description-text {
    -webkit-line-clamp: 3;
  }

  .character-actions {
    width: 60px;
  }

  .action-btn {
    width: 1.75rem;
    height: 1.75rem;
  }
}

@media (max-width: 480px) {
  .character-table {
    font-size: 0.75rem;
  }

  .character-table th,
  .character-table td {
    padding: 0.5rem 0.25rem;
  }

  .character-actions {
    flex-direction: column;
    gap: 0.25rem;
    width: 50px;
  }

  .action-btn {
    width: 1.5rem;
    height: 1.5rem;
  }

  .action-icon {
    width: 0.875rem;
    height: 0.875rem;
  }

  .description-text {
    font-size: 0.75rem;
    -webkit-line-clamp: 4;
  }
}
</style>