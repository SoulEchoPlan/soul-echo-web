<template>
  <li
    class="character-item"
    :class="{ active: isActive }"
    @click="handleSelect"
  >
    <div class="character-info">
      <h3 class="name">{{ character.name }}</h3>
      <p class="tags">{{ character.personaPrompt ? character.personaPrompt.substring(0, 30) + '...' : '无描述' }}</p>
    </div>
    <button class="select-btn">{{ isActive ? '已选' : '选择' }}</button>
  </li>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  character: {
    type: Object,
    required: true
  },
  activeCharacterId: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['select'])

const isActive = computed(() => {
  return props.character.id === props.activeCharacterId
})

const handleSelect = () => {
  if (!isActive.value) {
    emit('select', props.character.id)
  }
}
</script>

<style scoped>
.character-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  border: 2px solid transparent;
  transition: background-color 0.2s ease, border-color 0.2s ease;
  cursor: pointer;
  gap: 1rem;
}

.character-item:hover {
  background-color: var(--secondary-bg);
}

.character-item.active {
  background-color: var(--secondary-bg);
  border-color: var(--accent-color);
}

.character-info {
  flex: 1;
  min-width: 0; /* 允许收缩 */
  overflow: hidden;
}

.character-info .name {
  font-weight: 700;
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.character-info .tags {
  font-size: 0.85rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.character-item .select-btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  background-color: var(--accent-color);
  color: white;
  cursor: pointer;
  transition: background-color 0.2s ease;
  flex-shrink: 0; /* 强制保持宽度，不允许压缩 */
  white-space: nowrap;
}

.character-item .select-btn:hover {
  background-color: var(--accent-hover);
}

.character-item.active .select-btn {
  background-color: var(--secondary-bg);
  color: var(--text-muted);
  cursor: default;
}
</style>