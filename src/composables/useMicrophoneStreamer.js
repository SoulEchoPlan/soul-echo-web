import { ref, onUnmounted } from 'vue'

export function useMicrophoneStreamer() {
  // 录音状态
  const recording = ref({
    isRecording: false,
    processing: false,
    error: null
  })

  let mediaRecorder = null
  let audioChunks = []
  let stream = null
  let onAudioDataCallback = null

  // 初始化音频
  const initialize = async () => {
    try {
      // 请求麦克风权限
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      })
      return stream
    } catch (error) {
      console.error('麦克风初始化失败:', error)
      recording.value.error = error.message
      throw error
    }
  }

  // 开始录音
  const startRecording = async (onAudioData) => {
    try {
      // 确保音频已初始化
      if (!stream) {
        await initialize()
      }

      onAudioDataCallback = onAudioData
      audioChunks = []

      // 创建MediaRecorder
      const options = {
        mimeType: 'audio/webm;codecs=opus'
      }

      // 检查浏览器支持
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        // 尝试其他格式
        const alternativeTypes = [
          'audio/webm',
          'audio/mp4',
          'audio/ogg;codecs=opus',
          'audio/wav'
        ]

        for (const type of alternativeTypes) {
          if (MediaRecorder.isTypeSupported(type)) {
            options.mimeType = type
            break
          }
        }
      }

      mediaRecorder = new MediaRecorder(stream, options)

      // 处理录音数据
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data)

          // 如果有回调函数，处理音频数据
          if (onAudioDataCallback) {
            processAudioChunk(event.data)
          }
        }
      }

      mediaRecorder.onstop = () => {
        recording.value.isRecording = false
        recording.value.processing = false

        // 合并所有音频块
        if (audioChunks.length > 0 && onAudioDataCallback) {
          const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType })
          processAudioBlob(audioBlob)
        }
      }

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder错误:', event.error)
        recording.value.error = event.error.message
        recording.value.isRecording = false
        recording.value.processing = false
      }

      // 开始录音
      mediaRecorder.start(100) // 每100ms收集一次数据
      recording.value.isRecording = true
      recording.value.processing = true
      recording.value.error = null

    } catch (error) {
      console.error('录音启动失败:', error)
      recording.value.error = error.message
      recording.value.isRecording = false
      recording.value.processing = false
      throw error
    }
  }

  // 停止录音
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop()
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
      console.error('音频块处理失败:', error)
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
      console.error('音频Blob处理失败:', error)
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
  }

  // 组件卸载时清理
  onUnmounted(() => {
    cleanup()
  })

  return {
    recording,
    startRecording,
    stopRecording,
    initialize,
    cleanup
  }
}