<template>
  <div class="character-table-wrapper">
    <!-- 搜索栏 -->
    <div class="search-section">
      <div class="search-input-container">
        <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"></path>
        </svg>
        <input
          :model-value="searchQuery"
          @input="$emit('search', $event.target.value)"
          type="text"
          placeholder="搜索角色名称..."
          class="search-input"
        />
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>正在加载角色数据...</p>
    </div>

    <!-- 空状态 -->
    <div v-else-if="characters.length === 0" class="empty-state">
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
          <tr v-for="character in characters" :key="character.id" class="character-row">
            <td class="character-name">{{ character.name }}</td>
            <td class="character-description">
              <span class="description-text">{{ character.personaPrompt }}</span>
            </td>
            <td class="character-actions">
              <button
                class="action-btn edit-btn"
                @click="$emit('edit', character)"
                title="编辑角色"
              >
                <svg class="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"></path>
                </svg>
              </button>
              <button
                class="action-btn delete-btn"
                @click="$emit('delete', character)"
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
  </div>
</template>

<script setup>
/**
 * CharacterTable - 角色列表表格组件
 *
 * @props
 * - characters: 角色列表数据
 * - isLoading: 加载状态
 * - searchQuery: 搜索关键词
 *
 * @emits
 * - search: 搜索事件
 * - edit: 编辑角色
 * - delete: 删除角色
 */
defineProps({
  characters: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  searchQuery: {
    type: String,
    default: ''
  }
})

defineEmits(['search', 'edit', 'delete'])
</script>

<style scoped>
.character-table-wrapper {
  width: 100%;
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

/* 操作列表头右对齐，对齐到按钮中间 */
.character-table th:last-child {
  text-align: right;
  padding-right: 2.5rem;
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

/* 操作列单元格右对齐 */
.character-table td:last-child {
  text-align: right;
}

.character-name {
  font-weight: 600;
  color: var(--text-color);
}

.character-description {
  max-width: 0;
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
  justify-content: flex-end;
  gap: 0.5rem;
  white-space: nowrap;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: transparent;
}

.action-icon {
  width: 1.25rem;
  height: 1.25rem;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .search-input-container {
    max-width: none;
  }

  .character-table th,
  .character-table td {
    padding: 0.75rem 0.5rem;
    font-size: 0.813rem;
  }

  .description-text {
    -webkit-line-clamp: 3;
  }

  .action-btn {
    padding: 0.375rem;
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
    align-items: flex-end;
    gap: 0.25rem;
  }

  .action-btn {
    padding: 0.25rem;
  }

  .action-icon {
    width: 1.125rem;
    height: 1.125rem;
  }

  .description-text {
    font-size: 0.75rem;
    -webkit-line-clamp: 4;
  }
}
</style>
