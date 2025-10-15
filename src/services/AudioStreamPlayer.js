/**
 * AudioStreamPlayer - 使用 Web Audio API 实现流式音频播放
 * 支持接收 ArrayBuffer 格式的音频数据块并无缝播放
 */
class AudioStreamPlayer {
  constructor() {
    this.audioContext = null
    this.audioQueue = []
    this.isPlaying = false
  }

  /**
   * 初始化音频上下文
   * 必须由用户交互（如点击按钮）触发，以满足浏览器的安全策略
   */
  initialize() {
    if (this.audioContext) {
      return
    }

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
      console.log('AudioContext 初始化成��')
    } catch (error) {
      console.error('AudioContext 初始化失败:', error)
      throw error
    }
  }

  /**
   * 接收音频数据块
   * @param {ArrayBuffer} audioChunk - 音频数据块（WAV/PCM 格式）
   */
  async receive(audioChunk) {
    if (!this.audioContext) {
      console.warn('AudioContext 未初始化，无法接收音频数据')
      return
    }

    try {
      // 解码音频数据
      const audioBuffer = await this.audioContext.decodeAudioData(audioChunk.slice(0))

      // 推入队列
      this.audioQueue.push(audioBuffer)

      // 如果当前未播放，开始播放
      if (!this.isPlaying) {
        this.playNextChunk()
      }
    } catch (error) {
      console.error('音频解码失败:', error)
    }
  }

  /**
   * 播放队列中的下一个音频块
   */
  playNextChunk() {
    // 如果队列为空，停止播放
    if (this.audioQueue.length === 0) {
      this.isPlaying = false
      return
    }

    this.isPlaying = true

    // 从队列中取出一个音频块
    const audioBuffer = this.audioQueue.shift()

    // 创建音频源节点
    const source = this.audioContext.createBufferSource()
    source.buffer = audioBuffer

    // 连接到扬声器
    source.connect(this.audioContext.destination)

    // 设置播放结束回调，实现无缝衔接
    source.onended = () => {
      this.playNextChunk()
    }

    // 开始播放
    source.start(0)
  }

  /**
   * 清空音频队列
   */
  clear() {
    this.audioQueue = []
    this.isPlaying = false
  }

  /**
   * 销毁音频上下文
   */
  destroy() {
    this.clear()
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
  }
}

export default AudioStreamPlayer