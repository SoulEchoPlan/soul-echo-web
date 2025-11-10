<template>
  <header class="app-header">
    <h1 class="logo">魂语计划</h1>
    <button class="theme-switcher" @click="$emit('toggle-theme')">
      <i :data-feather="props.theme === 'dark' ? 'sun' : 'moon'"></i>
      <span>{{ props.theme === 'dark' ? '亮色' : '暗色' }}</span>
    </button>
  </header>
</template>

<script setup>
import { onMounted } from 'vue'
import feather from 'feather-icons'

const props = defineProps({
  theme: String
})

defineEmits(['toggle-theme'])

onMounted(() => {
  // 初始化feather图标
  feather.replace()
})
</script>

