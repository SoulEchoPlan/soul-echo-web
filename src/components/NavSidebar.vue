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
  flex: 0 0 200px; /* 展开宽度 200px */
  background-color: var(--panel-bg);
  border-radius: 12px;
  padding: 1rem 0; /* 仅保留上下内边距，移除左右 */
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow);
}

.nav-sidebar.collapsed {
  flex: 0 0 60px; /* 收起宽度 60px */
}

.nav-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  width: 100%;
  padding-left: 12px; /* 展开状态左侧对齐边距 */
}

.nav-sidebar.collapsed .nav-header {
  justify-content: center; /* 收起状态居中 */
  padding-left: 0; /* 移除左边距 */
}

.nav-toggle {
  width: 100%; /* 占满容器宽度 */
  height: 50px; /* 统一高度 */
  background: transparent; /* 移除默认背景 */
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: flex-start; /* 展开状态左对齐 */
  border: none;
  padding: 0; /* 内部padding由icon-container控制 */
  transition: all 0.2s ease;
}

.nav-sidebar.collapsed .nav-toggle {
  justify-content: center; /* 收起状态居中对齐 */
}

.nav-toggle:hover {
  background: var(--secondary-bg); /* hover时与nav-link一致 */
}

.nav-menu {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0 12px; /* 左右内边距与nav-header保持一致 */
}

.nav-sidebar.collapsed .nav-menu {
  padding: 0; /* 收起状态移除左右内边距 */
}

.nav-link {
  display: flex;
  align-items: center;
  justify-content: flex-start; /* 展开状态左对齐 */
  height: 50px; /* 与nav-toggle统一高度 */
  padding: 0; /* 移除padding，由子元素控制 */
  border-radius: 8px;
  text-decoration: none;
  color: var(--text-muted);
  gap: 12px; /* 图标与文本间距 */
  overflow: hidden;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.nav-sidebar.collapsed .nav-link {
  justify-content: center; /* 收起状态居中对齐 */
  gap: 0; /* 移除间距 */
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

/* 图标容器 - 确保所有图标严格对齐 */
.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0; /* 防止压缩 */
}

.icon-container i {
  width: 20px;
  height: 20px;
}

/* 收起状态下的样式 */
.nav-sidebar.collapsed .nav-text {
  opacity: 0;
  width: 0;
  visibility: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 文本过渡动画 */
.nav-text {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
}
</style>