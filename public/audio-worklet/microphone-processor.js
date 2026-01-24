// public/audio-worklet/microphone-processor.js

class MicrophoneProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this.targetSampleRate = 16000; // 阿里云要求的采样率
    this.isRecording = false;
    // 从 processorOptions 获取初始采样率，如果没有则使用默认值 48000
    this.currentSampleRate = options?.processorOptions?.sampleRate || 48000;
    this.audioDataCount = 0;

    // 音频数据缓冲区
    this.bufferSize = 4096;
    this.buffer = new Int16Array(this.bufferSize);
    this.bufferIndex = 0;

    this.leftover = new Float32Array(0);

    // 监听主线程的消息
    this.port.onmessage = (event) => {
      if (event.data.type === 'UPDATE_RECORDING_STATE') {
        if (this.isRecording && !event.data.isRecording) {
          // 停止录音时，发送剩余数据
          this.flush();
        }
        this.isRecording = event.data.isRecording;
        // 录音状态切换时，清空残留数据，防止旧数据污染
        if (this.isRecording) {
           this.leftover = new Float32Array(0);
           this.bufferIndex = 0;
        }
        console.log(`[Processor] 收到UPDATE_RECORDING_STATE: ${this.isRecording}`);
      } else if (event.data.type === 'UPDATE_SAMPLE_RATE') {
        this.currentSampleRate = event.data.sampleRate;
        console.log(`[Processor] 收到UPDATE_SAMPLE_RATE: ${this.currentSampleRate}`);
      }
    };

    console.log('[Processor] MicrophoneProcessor初始化完成 (Stateful Resampling)');
  }

  process(inputs, outputs, parameters) {
    if (!this.isRecording) {
      return true;
    }

    const input = inputs[0];
    if (!input || input.length === 0) {
      return true;
    }

    const inputData = input[0]; // Float32Array, 通常长度为 128
    if (!inputData || inputData.length === 0) {
      return true;
    }

    // === 1. 拼接剩余数据 ===
    // 将上一帧剩下的数据拼接到当前数据前面
    const combinedInput = new Float32Array(this.leftover.length + inputData.length);
    combinedInput.set(this.leftover);
    combinedInput.set(inputData, this.leftover.length);

    // === 2. 计算输出长度 ===
    const ratio = this.currentSampleRate / this.targetSampleRate;
    // 计算这些输入数据能生成多少个完整的输出采样点
    const outputLength = Math.floor(combinedInput.length / ratio);

    // === 3. 执行重采样 (Linear Interpolation) ===
    const pcmData = new Int16Array(outputLength);

    for (let i = 0; i < pcmData.length; i++) {
      const exactIndex = i * ratio;  // 精确位置（可能有小数）
      const index0 = Math.floor(exactIndex);  // 左侧采样点
      const index1 = Math.min(index0 + 1, combinedInput.length - 1);  // 右侧采样点
      const fraction = exactIndex - index0;  // 小数部分（0~1）

      // 线性插值：interpolated = sample0 + (sample1 - sample0) * fraction
      const sample0 = combinedInput[index0];
      const sample1 = combinedInput[index1];
      const interpolated = sample0 + (sample1 - sample0) * fraction;

      // 转换为 Int16
      const s = Math.max(-1, Math.min(1, interpolated));
      pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }

    // === 4. 保存剩余数据 ===
    // 下一个输出采样点需要的输入索引是 Math.floor(outputLength * ratio)
    // 所以从这个索引开始的数据都属于"余数"，留给下一帧
    const nextInputIndex = Math.floor(outputLength * ratio);
    this.leftover = combinedInput.slice(nextInputIndex);

    // === 5. 写入发送缓冲区 ===
    for (let i = 0; i < pcmData.length; i++) {
      this.buffer[this.bufferIndex++] = pcmData[i];

      // 缓冲区满，发送
      if (this.bufferIndex >= this.buffer.length) {
        this.sendBuffer();
      }
    }

    return true;
  }

  // 发送并重置缓冲区
  sendBuffer() {
    if (this.bufferIndex > 0) {
        this.audioDataCount++;

        // 第一个包的音频质量检测
        if (this.audioDataCount === 1) {
          const view = new Int16Array(this.buffer.buffer.slice(0, this.bufferIndex));
          let sumSquares = 0;
          for (let i = 0; i < view.length; i++) {
            sumSquares += view[i] * view[i];
          }
          const rms = Math.sqrt(sumSquares / view.length);
          console.log(`[Processor] 第一个包音频能量(RMS): ${rms.toFixed(2)}`);
          console.log(`[Processor] 前10个采样点:`, Array.from(view.slice(0, 10)));
        }

        // 只有缓冲区填满或强制flush时发送，使用 slice 切片发送有效数据
        const sendData = this.buffer.slice(0, this.bufferIndex).buffer;

        this.port.postMessage({
          type: 'AUDIO_DATA',
          data: sendData
        }, [sendData]);

        if (this.audioDataCount % 50 === 0) {
             console.log(`[Processor] 发送包 #${this.audioDataCount}`);
        }

        this.bufferIndex = 0;
    }
  }

  // 强制清空缓冲区 (用于停止录音时)
  flush() {
      if (this.bufferIndex > 0) {
          console.log(`[Processor] 录音结束，Flush剩余数据: ${this.bufferIndex}点`);
          this.sendBuffer();
      }
  }
}

registerProcessor('microphone-processor', MicrophoneProcessor);