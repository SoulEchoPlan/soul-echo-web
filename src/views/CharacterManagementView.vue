<template>
  <div class="character-management">
    <!-- 顶部栏：标题 + 创建按钮 -->
    <div class="page-header">
      <div>
        <h1 class="page-title">角色管理</h1>
        <p class="page-subtitle">创建、编辑和管理你的 AI 角色。</p>
      </div>
      <button class="create-btn" @click="openCreateModal">
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        创建新角色
      </button>
    </div>

    <!-- 角色表格组件 -->
    <CharacterTable
      :characters="filteredCharacters"
      :is-loading="characterStore.isLoading"
      :search-query="searchQuery"
      @search="handleSearch"
      @edit="openEditModal"
      @delete="handleDelete"
    />

    <!-- 创建/编辑模态框组件 -->
    <CharacterModal
      :visible="showModal"
      :is-editing="isEditing"
      :character="editingCharacter"
      @close="closeModal"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCharacterStore } from '@/stores/character'
import { useToastStore } from '@/stores/toast'
import CharacterTable from '@/components/character/CharacterTable.vue'
import CharacterModal from '@/components/character/CharacterModal.vue'

/**
 * CharacterManagementView - 角色管理页面（容器组件）
 *
 * 职责：
 * - 数据获取与状态管理
 * - 协调子组件交互
 * - 处理业务逻辑（调用 Store）
 */
const characterStore = useCharacterStore()
const toastStore = useToastStore()

// ========== 响应式状态 ==========
const searchQuery = ref('')
const showModal = ref(false)
const isEditing = ref(false)
const editingCharacter = ref(null)

// ========== 计算属性 ==========
/**
 * 过滤后的角色列表
 */
const filteredCharacters = computed(() => {
  if (!searchQuery.value) {
    return characterStore.characters
  }
  const term = searchQuery.value.toLowerCase()
  return characterStore.characters.filter(character =>
    character.name.toLowerCase().includes(term)
  )
})

// ========== 业务方法 ==========

/**
 * 生成头像 URL
 * @param {string} name - 角色名称
 * @returns {string} 头像 URL
 */
const generateAvatarUrl = (name) => {
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`
}

/**
 * 打开创建模态框
 */
const openCreateModal = () => {
  isEditing.value = false
  editingCharacter.value = null
  showModal.value = true
}

/**
 * 打开编辑模态框
 * @param {Object} character - 角色数据
 */
const openEditModal = (character) => {
  isEditing.value = true
  editingCharacter.value = character
  showModal.value = true
}

/**
 * 关闭模态框
 */
const closeModal = () => {
  showModal.value = false
  isEditing.value = false
  editingCharacter.value = null
}

/**
 * 处理搜索输入
 * @param {string} query - 搜索关键词
 */
const handleSearch = (query) => {
  searchQuery.value = query
}

/**
 * 处理表单提交（创建/编辑）
 * @param {Object} formData - 表单数据
 */
const handleSubmit = async (formData) => {
  try {
    // 生成头像 URL
    const avatarUrl = generateAvatarUrl(formData.name)

    // 构建角色数据对象
    const characterData = {
      name: formData.name,
      personaPrompt: formData.personaPrompt,
      avatarUrl: avatarUrl,
      voiceId: '', // 使用默认语音 ID
      isPublic: false // 默认为私有角色
    }

    if (isEditing.value) {
      // 更新角色
      await characterStore.updateCharacter(editingCharacter.value.id, characterData)
      toastStore.success('角色更新成功！')
    } else {
      // 创建角色
      await characterStore.addCharacter(characterData)
      toastStore.success('角色创建成功！')
    }

    closeModal()
  } catch (error) {
    console.error('保存角色失败:', error)
    toastStore.error('操作失败，请重试')
  }
}

/**
 * 确认并删除角色
 * @param {Object} character - 角色数据
 */
const handleDelete = async (character) => {
  if (confirm(`确定要删除角色 "${character.name}" 吗？此操作不可恢复。`)) {
    try {
      await characterStore.deleteCharacter(character.id)
      toastStore.success('角色删除成功！')
    } catch (error) {
      console.error('删除角色失败:', error)
      toastStore.error('删除失败，请重试')
    }
  }
}

// ========== 生命周期 ==========
onMounted(async () => {
  await characterStore.fetchCharacters()
})
</script>

<style scoped>
.character-management {
  width: 100%;
  max-width: 100%;
  padding: 1rem;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .character-management {
    padding: 0.75rem;
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
}
</style>
