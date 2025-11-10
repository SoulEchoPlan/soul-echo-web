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

