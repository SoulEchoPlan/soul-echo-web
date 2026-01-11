<template>
  <!-- 创建/编辑模态框 -->
  <div v-if="visible" class="modal-overlay" @click.self="handleClose">
    <div class="modal-container">
      <form @submit.prevent="handleSubmit" class="character-form">
        <div class="modal-header">
          <h2 class="modal-title">{{ isEditing ? '编辑角色' : '创建新角色' }}</h2>
          <button type="button" class="close-btn" @click="handleClose">
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
              v-model="formData.name"
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
              v-model="formData.personaPrompt"
              rows="3"
              required
              placeholder="详细描述角色的性格、背景、说话风格等..."
              class="form-textarea"
            ></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-cancel" @click="handleClose">
            取消
          </button>
          <button type="submit" class="btn-submit" :disabled="isSubmitting">
            {{ isSubmitting ? '保存中...' : '保存' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

/**
 * CharacterModal - 角色创建/编辑模态框组件
 *
 * @props
 * - visible: 控制模态框显示
 * - isEditing: 是否为编辑模式
 * - character: 编辑时的角色数据
 *
 * @emits
 * - close: 关闭模态框
 * - submit: 提交表单数据 { id?, name, personaPrompt }
 */
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  isEditing: {
    type: Boolean,
    default: false
  },
  character: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'submit'])

// 表单数据
const formData = ref({
  name: '',
  personaPrompt: ''
})

// 提交状态
const isSubmitting = ref(false)

/**
 * 监听角色数据变化，自动填充表单
 */
watch(() => props.character, (newCharacter) => {
  if (newCharacter) {
    formData.value = {
      name: newCharacter.name || '',
      personaPrompt: newCharacter.personaPrompt || ''
    }
  } else {
    // 重置表单
    formData.value = {
      name: '',
      personaPrompt: ''
    }
  }
}, { immediate: true })

/**
 * 关闭模态框
 */
const handleClose = () => {
  emit('close')
}

/**
 * 处理表单提交
 */
const handleSubmit = async () => {
  if (isSubmitting.value) return

  isSubmitting.value = true

  try {
    // 构建提交数据
    const submitData = {
      name: formData.value.name,
      personaPrompt: formData.value.personaPrompt
    }

    // 如果是编辑模式，添加 id
    if (props.isEditing && props.character) {
      submitData.id = props.character.id
    }

    emit('submit', submitData)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
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
  margin-bottom: 1rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  margin-bottom: 0.4rem;
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--text-color);
}

.form-input, .form-textarea {
  width: 100%;
  background-color: var(--secondary-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.6rem 0.75rem;
  font-size: 0.875rem;
  color: var(--text-color);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  resize: vertical;
  font-family: inherit;
  line-height: 1.4;
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
}
</style>
