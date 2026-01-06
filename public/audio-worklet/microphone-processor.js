// 音频处理器 Worklet
class MicrophoneProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.targetSampleRate = 16000; // 阿里云要求的采样率
    this.isRecording = false;
    this.currentSampleRate = 48000; // 默认采样率

    // 监听主线程的消息
    this.port.onmessage = (event) => {
      if (event.data.type === 'UPDATE_RECORDING_STATE') {
        this.isRecording = event.data.isRecording;
      } else if (event.data.type === 'UPDATE_SAMPLE_RATE') {
        this.currentSampleRate = event.data.sampleRate;
      }
    };
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

    // 发送处理后的数据到主线程
    this.port.postMessage({
      type: 'AUDIO_DATA',
      data: pcmData.buffer
    }, [pcmData.buffer]); // 转移所有权

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