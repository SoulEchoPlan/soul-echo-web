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
        <component
          v-if="iconComponent"
          :is="iconComponent"
          :class="['h-5 w-5 mr-3', iconClass]"
        />
        <span class="text-white font-medium">{{ message }}</span>
        <button
          @click="hide"
          class="ml-4 text-white/80 hover:text-white transition-colors"
        >
          <X class="h-4 w-4" />
        </button>
      </div>
    </div>
  </teleport>
</template>

<script>
import { ref, computed, nextTick } from 'vue'
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X
} from 'lucide-vue-next'

export default {
  name: 'Notification',
  components: {
    CheckCircle,
    XCircle,
    AlertTriangle,
    Info,
    X
  },
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

    const iconComponent = computed(() => {
      const icons = {
        success: CheckCircle,
        error: XCircle,
        warning: AlertTriangle,
        info: Info
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
      iconComponent,
      iconClass,
      show,
      hide
    }
  }
}
</script>

