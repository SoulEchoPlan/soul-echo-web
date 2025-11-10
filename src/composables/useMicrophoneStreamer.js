import { ref, onUnmounted } from 'vue'
import { handleAudioError, showNotification, devLog } from '@/utils/errorHandler'
import { validateCharacter } from '@/utils/validators'
import config from '@/config'

export function useMicrophoneStreamer() {
  // 录音状态
  const recording = ref({
    isRecording: false,
    processing: false,
    error: null
  })

  // 支持状态
  const isSupported = ref(false)

  let mediaRecorder = null
  let audioChunks = []
  let stream = null
  let onAudioDataCallback = null

  // 检查浏览器支持
  const checkSupport = () => {
    isSupported.value = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && MediaRecorder)
    if (!isSupported.value) {
      devLog('浏览器不支持录音功能', 'Warning')
    }
    return isSupported.value
  }

  // 初始化音频
  const initialize = async () => {
    try {
      // 检查浏览器支持
      if (!checkSupport()) {
        throw new Error('浏览器不支持录音功能')
      }

      // 请求麦克风权限
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: config.AUDIO.SAMPLE_RATE,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })
      return stream
    } catch (error) {
      handleAudioError(error, '麦克风初始化失败')
      recording.value.error = error.message
      throw error
    }
  }

  // 开始录音
  const startRecording = async (onAudioData, options = {}) => {
    const {
      character = null,
      autoSend = false,
      websocketService = null
    } = options

    try {
      // 验证角色数据（如果提供）
      if (character) {
        const validation = validateCharacter(character)
        if (!validation.isValid) {
          throw new Error(validation.message)
        }
      }

      // 确保音频已初始化
      if (!stream) {
        await initialize()
      }

      onAudioDataCallback = onAudioData
      audioChunks = []

      // 创建MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/ogg'

      mediaRecorder = new MediaRecorder(stream, { mimeType })

      // 处理录音数据
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data)

          // 如果有回调函数，处理音频数据
          if (onAudioDataCallback) {
            processAudioChunk(event.data)
          }

          // 自动发送数据（如果配置了 WebSocket 服务）
          if (autoSend && websocketService) {
            try {
              websocketService.send(event.data)
            } catch (error) {
              devLog('发送音频数据失败', 'Error')
            }
          }
        }
      }

      mediaRecorder.onstop = () => {
        recording.value.isRecording = false
        recording.value.processing = false
        devLog('录音已停止')

        // 合并所有音频块
        if (audioChunks.length > 0 && onAudioDataCallback) {
          const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType })
          processAudioBlob(audioBlob)
        }
      }

      mediaRecorder.onerror = (event) => {
        handleAudioError(event.error, '录音过程出错')
        recording.value.error = event.error.message
        recording.value.isRecording = false
        recording.value.processing = false
      }

      // 开始录音
      mediaRecorder.start(config.AUDIO.RECORD_INTERVAL)
      recording.value.isRecording = true
      recording.value.processing = true
      recording.value.error = null
      devLog('录音已开始')

      return true

    } catch (error) {
      handleAudioError(error, '录音启动失败')
      recording.value.error = error.message
      recording.value.isRecording = false
      recording.value.processing = false
      return false
    }
  }

  // 停止录音
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop()
    }
  }

  // 切换录音状态
  const toggleRecording = async (onAudioData, options = {}) => {
    if (recording.value.isRecording) {
      stopRecording()
      return false
    } else {
      return await startRecording(onAudioData, options)
    }
  }

  // 处理音频块
  const processAudioChunk = async (chunk) => {
    try {
      // 将音频块转换为ArrayBuffer
      const arrayBuffer = await chunk.arrayBuffer()

      // 如果有回调函数，调用它
      if (onAudioDataCallback) {
        onAudioDataCallback(arrayBuffer)
      }
    } catch (error) {
      handleAudioError(error, '音频块处理失败')
    }
  }

  // 处理完整的音频Blob
  const processAudioBlob = async (blob) => {
    try {
      // 将完整的音频Blob转换为ArrayBuffer
      const arrayBuffer = await blob.arrayBuffer()

      // 如果有回调函数，调用它
      if (onAudioDataCallback) {
        onAudioDataCallback(arrayBuffer)
      }
    } catch (error) {
      handleAudioError(error, '音频Blob处理失败')
    }
  }

  // 获取录音的音频数据
  const getAudioBlob = () => {
    if (audioChunks.length === 0) {
      return null
    }
    return new Blob(audioChunks, { type: mediaRecorder?.mimeType || 'audio/webm' })
  }

  // 清空音频数据
  const clearAudioChunks = () => {
    audioChunks = []
  }

  // 请求麦克风权限
  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // 立即停止流，只是为了请求权限
      stream.getTracks().forEach(track => track.stop())
      return true
    } catch (error) {
      handleAudioError(error, '麦克风权限请求失败')
      return false
    }
  }

  // 检查麦克风权限状态
  const checkMicrophonePermission = async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'microphone' })
      return permission.state
    } catch (error) {
      devLog('无法检查麦克风权限状态', 'Warning')
      return 'prompt'
    }
  }

  // 清理资源
  const cleanup = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop()
    }

    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      stream = null
    }

    audioChunks = []
    onAudioDataCallback = null
    recording.value.isRecording = false
    recording.value.processing = false
    recording.value.error = null
  }

  // 组件卸载时清理
  onUnmounted(() => {
    cleanup()
  })

  return {
    // 状态
    recording,
    isSupported,

    // 方法
    startRecording,
    stopRecording,
    toggleRecording,
    initialize,
    cleanup,
    getAudioBlob,
    clearAudioChunks,
    requestMicrophonePermission,
    checkMicrophonePermission,
    checkSupport
  }
}