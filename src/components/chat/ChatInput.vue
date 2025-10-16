<template>
  <div class="p-6 border-t border-gray-700 bg-gray-800/70 flex-shrink-0">
    <div class="flex flex-col items-center">
      <!-- 状态指示器 -->
      <div class="text-sm text-gray-400 h-5 mb-3">
        {{ statusText }}
      </div>
      <!-- 语音录制按钮 -->
      <button
        @click="handleToggleRecording"
        :disabled="disabled"
        :class="[
          'rounded-full w-16 h-16 flex items-center justify-center transition-all duration-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900',
          isRecording
            ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
            : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        ]"
      >
        <Mic v-if="!isRecording" class="h-8 w-8 text-white" />
        <Square v-else class="h-7 w-7 text-white" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Mic, Square } from 'lucide-vue-next'

const props = defineProps({
  isRecording: {
    type: Boolean,
    default: false
  },
  isConnecting: {
    type: Boolean,
    default: false
  },
  isAiThinking: {
    type: Boolean,
    default: false
  },
  isProcessing: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle-recording'])

const statusText = computed(() => {
  if (props.isConnecting) return '正在连接...'
  if (props.isRecording) return '正在聆听...'
  if (props.isAiThinking) return 'AI正在思考...'
  if (props.isProcessing) return '正在处理语音...'
  return '点击下方按钮开始说话'
})

const handleToggleRecording = () => {
  if (!props.disabled) {
    emit('toggle-recording')
  }
}
</script>

<style scoped>
/* 组件特定样式 */
</style>
