<template>
  <div id="app" class="flex flex-col h-screen bg-gray-900 text-white antialiased">
    <!-- 导航栏 -->
    <nav class="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <Bot class="h-8 w-8 text-indigo-400" />
            </div>
            <div class="hidden md:block">
              <div class="ml-10 flex items-baseline space-x-4">
                <a
                  href="#"
                  @click.prevent="setActivePage('page-chat')"
                  :class="[
                    'px-3 py-2 rounded-md text-sm font-medium',
                    activePage === 'page-chat'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  ]"
                >
                  角色聊天
                </a>
                <a
                  href="#"
                  @click.prevent="setActivePage('page-kb')"
                  :class="[
                    'px-3 py-2 rounded-md text-sm font-medium',
                    activePage === 'page-kb'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  ]"
                >
                  知识库管理
                </a>
                <a
                  href="#"
                  @click.prevent="setActivePage('page-cm')"
                  :class="[
                    'px-3 py-2 rounded-md text-sm font-medium',
                    activePage === 'page-cm'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  ]"
                >
                  角色管理
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主内容区 -->
    <main class="flex-grow overflow-hidden">
      <!-- 角色聊天页面 -->
      <div id="page-chat" v-show="activePage === 'page-chat'" class="h-full">
        <CharacterChat />
      </div>

      <!-- 知识库管理页面 -->
      <div id="page-kb" v-show="activePage === 'page-kb'" class="h-full">
        <KnowledgeBase />
      </div>

      <!-- 角色管理页面 -->
      <div id="page-cm" v-show="activePage === 'page-cm'" class="h-full">
        <CharacterManagement />
      </div>
    </main>

    <!-- 全局通知 -->
    <div
      id="notification"
      :class="[
        'fixed top-5 right-5 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg transform transition-transform duration-300 z-50',
        notificationVisible ? '' : 'translate-x-[120%]'
      ]"
    >
      {{ notificationMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Bot } from 'lucide-vue-next'
import CharacterChat from './views/CharacterChat.vue'
import KnowledgeBase from './views/KnowledgeBase.vue'
import CharacterManagement from './views/CharacterManagement.vue'

// 页面状态管理
const activePage = ref('page-chat')

// 通知状态
const notificationVisible = ref(false)
const notificationMessage = ref('操作成功！')

// 设置当前页面
const setActivePage = (pageId) => {
  activePage.value = pageId
}

// 显示通知
const showNotification = (message, type = 'success') => {
  notificationMessage.value = message
  notificationVisible.value = true

  // 设置通知样式
  const notificationEl = document.getElementById('notification')
  if (type === 'error') {
    notificationEl.className = notificationEl.className.replace('bg-green-500', 'bg-red-500')
  } else if (type === 'warning') {
    notificationEl.className = notificationEl.className.replace('bg-green-500', 'bg-yellow-500')
  } else {
    notificationEl.className = notificationEl.className.replace(/bg-(red|yellow)-500/, 'bg-green-500')
  }

  // 3秒后自动隐藏
  setTimeout(() => {
    notificationVisible.value = false
  }, 3000)
}

// 暴露方法给全局使用
window.showNotification = showNotification
</script>

<style>
body {
  font-family: 'Inter', sans-serif;
}
.character-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}
.character-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
/* 自定义滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #1f2937; /* bg-gray-800 */
}
::-webkit-scrollbar-thumb {
  background: #4b5563; /* bg-gray-600 */
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #6b7280; /* bg-gray-500 */
}
</style>