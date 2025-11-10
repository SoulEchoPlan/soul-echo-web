<template>
  <div id="app" class="flex flex-col h-screen">
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
        <ChatView ref="chatView" @refresh-characters="refreshCharacters" />
      </div>

      <!-- 知识库管理页面 -->
      <div id="page-kb" v-show="activePage === 'page-kb'" class="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
        <KnowledgeManager />
      </div>

      <!-- 角色管理页面 -->
      <div id="page-cm" v-show="activePage === 'page-cm'" class="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
        <CharacterManager
          @character-updated="refreshCharacters"
          @character-created="refreshCharacters"
          @character-deleted="refreshCharacters"
        />
      </div>
    </main>

    <!-- 全局通知 -->
    <Notification ref="notification" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCharacterStore } from '@/stores/character'
import ChatView from '@/components/chat/ChatView.vue'
import CharacterManager from '@/components/CharacterManager.vue'
import KnowledgeManager from '@/components/KnowledgeManager.vue'
import Notification from '@/components/Notification.vue'
import { Bot } from 'lucide-vue-next'

const characterStore = useCharacterStore()

// 页面状态
const activePage = ref('page-chat')

// UI元素引用
const chatView = ref(null)
const notification = ref(null)

// 设置当前页面
const setActivePage = (pageId) => {
  activePage.value = pageId
}

// 刷新角色列表
const refreshCharacters = async () => {
  try {
    await characterStore.fetchCharacters()
  } catch (error) {
    console.error('获取角色列表失败:', error)
    notification.value?.show('获取角色列表失败', 'error')
  }
}

onMounted(async () => {
  // 加载角色列表
  await refreshCharacters()
})
</script>

