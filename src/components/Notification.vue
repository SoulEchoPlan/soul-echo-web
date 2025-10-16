<template>
  <teleport to="body">
    <div
      v-if="visible"
      :class="[
        'fixed top-5 right-5 py-3 px-4 rounded-lg shadow-lg transform transition-all duration-300 z-50',
        notificationClass
      ]"
    >
      <div class="flex items-center">
        <i
          v-if="icon"
          :data-lucide="icon"
          :class="['h-5 w-5 mr-3', iconClass]"
        ></i>
        <span class="text-white font-medium">{{ message }}</span>
        <button
          @click="hide"
          class="ml-4 text-white/80 hover:text-white transition-colors"
        >
          <i data-lucide="x" class="h-4 w-4"></i>
        </button>
      </div>
    </div>
  </teleport>
</template>

<script>
import { ref, computed, nextTick } from 'vue'
import { lucide } from 'lucide-vue-next'

export default {
  name: 'Notification',
  setup() {
    const visible = ref(false)
    const message = ref('')
    const type = ref('info')

    const notificationClass = computed(() => {
      const baseClass = 'min-w-[300px] max-w-md'
      const typeClasses = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
      }
      return `${baseClass} ${typeClasses[type.value]}`
    })

    const icon = computed(() => {
      const icons = {
        success: 'check-circle',
        error: 'x-circle',
        warning: 'alert-triangle',
        info: 'info'
      }
      return icons[type.value]
    })

    const iconClass = computed(() => {
      return 'text-white'
    })

    let timeoutId = null

    const show = (msg, notificationType = 'info', duration = 3000) => {
      message.value = msg
      type.value = notificationType
      visible.value = true

      // 清除之前的定时器
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      // 自动隐藏
      if (duration > 0) {
        timeoutId = setTimeout(() => {
          hide()
        }, duration)
      }

      // ��新初始化图标
      nextTick(() => {
        lucide.createIcons()
      })
    }

    const hide = () => {
      visible.value = false
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
    }

    return {
      visible,
      message,
      type,
      notificationClass,
      icon,
      iconClass,
      show,
      hide
    }
  }
}
</script>

<style scoped>
/* 进入和离开动画 */
.transform {
  transform-origin: top right;
}

/* 确保通知不会遮挡重要内容 */
.fixed {
  position: fixed;
}

.top-5 {
  top: 1.25rem;
}

.right-5 {
  right: 1.25rem;
}

.z-50 {
  z-index: 50;
}
</style>