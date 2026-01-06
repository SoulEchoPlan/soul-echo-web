<template>
  <main class="chat-panel">
    <div class="character-indicator">
      <span class="character-name">当前角色：{{ activeCharacter?.name || '未选择角色' }}</span>
      <button
          class="tts-toggle-btn"
          :class="{ 'enabled': isTtsEnabled, 'tts-disabled': !isTtsEnabled }"
          @click="toggleTts"
          :aria-label="isTtsEnabled ? '关闭语音播放' : '开启语音播放'"
          title="TTS语音播放开关"
      >
        <i :data-feather="'volume-2'"></i>
      </button>
    </div>
    <ChatHistory />
    <ChatInput :ttsEnabled="isTtsEnabled" />
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { computed } from 'vue'
import { useCharacterStore } from '@/stores/character'
import ChatHistory from './ChatHistory.vue'
import ChatInput from './ChatInput.vue'
import feather from 'feather-icons'

const characterStore = useCharacterStore()

const activeCharacter = computed(() => characterStore.activeCharacter)

// TTS 语音播放开关状态（默认关闭，省钱模式）
const isTtsEnabled = ref(false)

// 切换 TTS 开关
const toggleTts = () => {
  isTtsEnabled.value = !isTtsEnabled.value
  // 更新 feather 图标
  setTimeout(() => feather.replace(), 0)
}
</script>

<style scoped>
.chat-panel {
  display: flex;
  flex-direction: column;
  flex: 3;
  background-color: var(--panel-bg);
  border-radius: 12px;
  box-shadow: var(--shadow);
  overflow: hidden;
}

.character-indicator {
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.character-indicator .character-name {
  flex: 1;
}

.character-indicator .tts-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background-color: transparent;
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-muted);
  padding: 0;
  position: relative;
}

.character-indicator .tts-toggle-btn:hover {
  background-color: var(--secondary-bg);
  border-color: var(--text-muted);
}

.character-indicator .tts-toggle-btn.enabled {
  background-color: var(--accent-color);
  border-color: var(--accent-color);
  color: white;
}

.character-indicator .tts-toggle-btn.enabled:hover {
  background-color: var(--accent-hover);
  border-color: var(--accent-hover);
}

.character-indicator .tts-toggle-btn i {
  width: 18px;
  height: 18px;
}

.character-indicator .tts-toggle-btn.tts-disabled::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 24px;
  height: 2px;
  background-color: currentColor;
  transform: translate(-50%, -50%) rotate(45deg);
  z-index: 10;
  pointer-events: none;
}
</style>