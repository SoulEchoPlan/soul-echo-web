<template>
  <nav class="nav-sidebar" :class="{ collapsed: isCollapsed }">
    <div class="nav-header">
      <button class="nav-toggle" @click="toggleCollapse">
        <div class="icon-container">
          <i data-feather="menu"></i>
        </div>
      </button>
    </div>

    <ul class="nav-menu">
      <li>
        <RouterLink to="/chat" class="nav-link" title="角色聊天">
          <div class="icon-container">
            <i data-feather="message-circle"></i>
          </div>
          <span class="nav-text">角色聊天</span>
        </RouterLink>
      </li>
      <li>
        <RouterLink to="/management" class="nav-link" title="角色管理">
          <div class="icon-container">
            <i data-feather="users"></i>
          </div>
          <span class="nav-text">角色管理</span>
        </RouterLink>
      </li>
      <li>
        <RouterLink to="/knowledge-base" class="nav-link" title="知识库管理">
          <div class="icon-container">
            <i data-feather="database"></i>
          </div>
          <span class="nav-text">知识库管理</span>
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import feather from 'feather-icons'

const isCollapsed = ref(false)

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

onMounted(() => {
  feather.replace()
})
</script>

<style scoped>
.nav-sidebar {
  flex: 0 0 200px;
  background-color: var(--panel-bg);
  border-radius: 12px;
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow);
}

.nav-sidebar.collapsed {
  flex: 0 0 72px;
}

.nav-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  width: 100%;
  padding-left: 12px;
  /* 增加高度限制，防止抖动 */
  min-height: 50px;
}

.nav-sidebar.collapsed .nav-header {
  justify-content: center;
  padding-left: 0;
}

.nav-toggle {
  /* 修改：宽度自适应，但最大不超过 50px */
  width: 100%;
  max-width: 50px;
  height: 50px;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  border: none;
  padding: 0;
  transition: all 0.2s ease;
}

/* 核心修复：折叠状态下的按钮样式 */
.nav-sidebar.collapsed .nav-toggle {
  justify-content: center;
  width: 40px;       /* 缩小宽度 */
  height: 40px;      /* 缩小高度 */
  margin: 0 auto;    /* 居中 */
  border-radius: 50%;
}

.nav-toggle:hover {
  background: var(--secondary-bg);
}

.nav-menu {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0 12px;
}

.nav-sidebar.collapsed .nav-menu {
  padding: 0;
}

.nav-link {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 50px;
  padding: 0;
  border-radius: 8px;
  text-decoration: none;
  color: var(--text-muted);
  gap: 12px;
  overflow: hidden;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.nav-sidebar.collapsed .nav-link {
  justify-content: center;
  gap: 0;
  width: 50px;
  height: 50px;
  margin: 0 auto;
  border-radius: 8px;
}

.nav-link:hover {
  background-color: var(--secondary-bg);
  color: var(--text-color);
}

.nav-link.router-link-active {
  background-color: var(--accent-color);
  color: white;
  font-weight: 500;
}

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.icon-container i {
  width: 20px;
  height: 20px;
}

.nav-sidebar.collapsed .nav-text {
  opacity: 0;
  width: 0;
  visibility: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-text {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
}
</style>