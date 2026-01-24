<template>
  <Transition name="toast-fade">
    <div v-if="visible" class="toast-message" :class="`toast-${type}`">
      <span class="toast-icon">{{ icon }}</span>
      <span class="toast-text">{{ message }}</span>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'

/**
 * ToastMessage - 全局提示消息组件
 * 支持 info/success/warning/error 四种类型，带有淡入淡出和上浮动画
 */
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['info', 'success', 'warning', 'error'].includes(value)
  }
})

// 根据类型显示不同的图标
const icon = computed(() => {
  const iconMap = {
    info: 'i',
    success: '✓',
    warning: '!',
    error: '✕'
  }
  return iconMap[props.type] || iconMap.info
})
</script>

<style scoped>
.toast-message {
  position: fixed;
  top: 10%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: white;
  padding: 12px 24px;
  border-radius: 50px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  min-width: 200px;
  max-width: 80%;
  justify-content: center;
}

.toast-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.toast-text {
  word-break: break-word;
  text-align: center;
}

/* Toast 类型样式 */
.toast-success {
  background: rgba(34, 197, 94, 0.9);
}

.toast-warning {
  background: rgba(251, 191, 36, 0.9);
}

.toast-error {
  background: rgba(239, 68, 68, 0.9);
}

/* 淡入淡出动画 */
.toast-fade-enter-active {
  animation: toast-in 0.3s ease-out;
}

.toast-fade-leave-active {
  animation: toast-out 0.3s ease-in;
}

@keyframes toast-in {
  0% {
    opacity: 0;
    transform: translate(-50%, 20px);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

@keyframes toast-out {
  0% {
    opacity: 1;
    transform: translate(-50%, 0);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -20px);
  }
}
</style>
