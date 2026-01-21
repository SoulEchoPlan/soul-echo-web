// 使用 AudioWorklet 的现代音频流处理器
export class ModernMicrophoneStreamer {
  constructor() {
    this.audioContext = null;
    this.mediaStreamSource = null;
    this.audioWorkletNode = null;
    this.isRecording = false;
    this.hasPermission = false;
    this.audioStream = null;
    this.onAudioDataCallback = null;
  }

  async initializeStream() {
    if (this.audioStream && this.audioStream.active) {
      return this.audioStream;
    }

    try {
      this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.hasPermission = true;
      return this.audioStream;
    } catch (error) {
      this.hasPermission = false;
      throw error;
    }
  }

  async start() {
    if (this.isRecording) {
      console.log('🎤 [MicrophoneStreamer] 已在录音状态，忽略重复启动');
      return;
    }

    try {
      console.log('[MicrophoneStreamer] 开始启动录音...');

      const stream = await this.initializeStream();
      console.log('[MicrophoneStreamer] 麦克风权限获取成功');

      // 创建 AudioContext
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      console.log('[MicrophoneStreamer] AudioContext创建成功，采样率:', this.audioContext.sampleRate);

      // 创建 MediaStreamSource
      this.mediaStreamSource = this.audioContext.createMediaStreamSource(stream);
      console.log('[MicrophoneStreamer] MediaStreamSource创建成功');

      // 加载 AudioWorklet
      console.log('[MicrophoneStreamer] 开始加载AudioWorklet...');
      await this.audioContext.audioWorklet.addModule('/audio-worklet/microphone-processor.js');
      console.log('[MicrophoneStreamer] AudioWorklet加载成功');

      // 创建 AudioWorkletNode
      this.audioWorkletNode = new AudioWorkletNode(this.audioContext, 'microphone-processor', {
        processorOptions: {
          sampleRate: this.audioContext.sampleRate
        }
      });

      let audioDataCount = 0;
      // 监听来自 AudioWorklet 的消息
      this.audioWorkletNode.port.onmessage = (event) => {
        if (event.data.type === 'AUDIO_DATA') {
          audioDataCount++;
          if (audioDataCount % 100 === 0) {
            console.log(`[MicrophoneStreamer] 收到音频数据包 #${audioDataCount}, 大小: ${event.data.data.byteLength} bytes`);
          }
          if (this.onAudioDataCallback) {
            this.onAudioDataCallback(event.data.data);
          } else {
            console.error('[MicrophoneStreamer] onAudioDataCallback未设置！');
          }
        }
      };

      // 发送当前采样率信息到处理器
      this.audioWorkletNode.port.postMessage({
        type: 'UPDATE_SAMPLE_RATE',
        sampleRate: this.audioContext.sampleRate
      });

      // 连接节点
      this.mediaStreamSource.connect(this.audioWorkletNode);

      this.isRecording = true;

      // 通知处理器开始录音
      this.audioWorkletNode.port.postMessage({
        type: 'UPDATE_RECORDING_STATE',
        isRecording: true
      });
      console.log('[MicrophoneStreamer] 已发送UPDATE_RECORDING_STATE(isRecording=true)');
      console.log('[MicrophoneStreamer] 录音启动完成！');

    } catch (error) {
      console.error('[MicrophoneStreamer] 启动录音失败:', error);
      throw new Error('无法获取麦克风权限，请检查浏览器设置并重试。');
    }
  }

  stop() {
    if (!this.isRecording) {
      return;
    }

    this.isRecording = false;

    // 通知处理器停止录音
    if (this.audioWorkletNode) {
      this.audioWorkletNode.port.postMessage({
        type: 'UPDATE_RECORDING_STATE',
        isRecording: false
      });
    }

    // 清理资源
    this.cleanup();
  }

  cleanup() {
    if (this.mediaStreamSource) {
      this.mediaStreamSource.disconnect();
      this.mediaStreamSource = null;
    }

    if (this.audioWorkletNode) {
      this.audioWorkletNode.disconnect();
      this.audioWorkletNode.port.close();
      this.audioWorkletNode = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  destroy() {
    this.stop();

    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop());
      this.audioStream = null;
    }

    this.hasPermission = false;
    this.onAudioDataCallback = null;
  }

  // 设置音频数据回调
  onAudioData(callback) {
    this.onAudioDataCallback = callback;
  }
}