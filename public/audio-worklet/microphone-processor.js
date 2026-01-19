// 音频处理器 Worklet
class MicrophoneProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.targetSampleRate = 16000; // 阿里云要求的采样率
    this.isRecording = false;
    this.currentSampleRate = 48000; // 默认采样率
    this.audioDataCount = 0;

    // 音频数据缓冲区（约 60-120ms 的音频数据）
    this.bufferSize = 2048; // 缓冲阈值（字节）
    this.buffer = new Int16Array(this.bufferSize / 2); // Int16Array，所以除以2
    this.bufferIndex = 0;

    // 监听主线程的消息
    this.port.onmessage = (event) => {
      if (event.data.type === 'UPDATE_RECORDING_STATE') {
        // 如果从录音状态切换到停止状态，发送缓冲区剩余数据
        if (this.isRecording && !event.data.isRecording && this.bufferIndex > 0) {
          console.log(`[Processor] 录音结束，发送剩余缓冲区数据: ${this.bufferIndex} 个采样点`);
          this.port.postMessage({
            type: 'AUDIO_DATA',
            data: this.buffer.slice(0, this.bufferIndex).buffer
          }, [this.buffer.slice(0, this.bufferIndex).buffer]);
          this.bufferIndex = 0;
        }
        this.isRecording = event.data.isRecording;
        console.log(`[Processor] 收到UPDATE_RECORDING_STATE: ${this.isRecording}`);
      } else if (event.data.type === 'UPDATE_SAMPLE_RATE') {
        this.currentSampleRate = event.data.sampleRate;
        console.log(`[Processor] 收到UPDATE_SAMPLE_RATE: ${this.currentSampleRate}`);
      }
    };

    console.log('[Processor] MicrophoneProcessor初始化完成，缓冲区大小:', this.bufferSize, '字节');
  }

  process(inputs, outputs, parameters) {
    if (!this.isRecording) {
      return true; // 保持处理器活跃
    }

    const input = inputs[0];
    if (!input || input.length === 0) {
      return true;
    }

    const inputData = input[0]; // 获取第一个输入通道
    if (!inputData) {
      return true;
    }

    // 重采样和转换
    const resampledData = this.resample(inputData, this.currentSampleRate, this.targetSampleRate);
    const pcmData = this.float32ToInt16(resampledData);

    // 将数据写入缓冲区
    for (let i = 0; i < pcmData.length; i++) {
      this.buffer[this.bufferIndex] = pcmData[i];
      this.bufferIndex++;

      // 当缓冲区填满时，发送数据到主线程
      if (this.bufferIndex >= this.buffer.length) {
        this.audioDataCount++;

        if (this.audioDataCount % 100 === 0) {
          console.log(`[Processor] 发送音频数据包 #${this.audioDataCount}, 大小: ${this.buffer.byteLength} bytes`);
        }

        // 发送完整缓冲区的数据（使用 slice() 创建副本，避免引用冲突）
        this.port.postMessage({
          type: 'AUDIO_DATA',
          data: this.buffer.slice().buffer // 创建副本并转移所有权
        }, [this.buffer.slice().buffer]);

        // 重置缓冲区索引
        this.bufferIndex = 0;
      }
    }

    return true;
  }

  // 重采样函数
  resample(input, fromSampleRate, toSampleRate) {
    if (fromSampleRate === toSampleRate) {
      return input;
    }

    const ratio = fromSampleRate / toSampleRate;
    const outputLength = Math.floor(input.length / ratio);
    const output = new Float32Array(outputLength);

    for (let i = 0; i < outputLength; i++) {
      const nearestInputIndex = Math.floor(i * ratio);
      output[i] = input[nearestInputIndex];
    }

    return output;
  }

  // 浮点数转16位PCM
  float32ToInt16(buffer) {
    const l = buffer.length;
    const buf = new Int16Array(l);

    for (let i = 0; i < l; i++) {
      buf[i] = Math.max(-32768, Math.min(32767, buffer[i] * 0x7FFF));
    }

    return buf;
  }
}

registerProcessor('microphone-processor', MicrophoneProcessor);