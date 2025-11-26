<template>
  <nav class="nav-sidebar" :class="{ collapsed: isCollapsed }">
    <div class="nav-header">
      <button class="nav-toggle" @click="toggleCollapse">
        <i data-feather="menu"></i>
      </button>
    </div>

    <ul class="nav-menu">
      <li>
        <RouterLink to="/chat" class="nav-link" title="角色聊天">
          <i data-feather="message-circle"></i>
          <span class="nav-text">角色聊天</span>
        </RouterLink>
      </li>
      <li>
        <RouterLink to="/management" class="nav-link" title="角色管理">
          <i data-feather="users"></i>
          <span class="nav-text">角色管理</span>
        </RouterLink>
      </li>
      <li>
        <RouterLink to="/knowledge-base" class="nav-link" title="知识库管理">
          <i data-feather="database"></i>
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
  padding: 1rem;
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
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 1.5rem;
  height: 40px; /* 固定高度确保对齐 */
}

.nav-toggle {
  background: var(--secondary-bg);
  border-radius: 8px;
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px; /* 固定宽度 */
  height: 40px; /* 固定高度 */
}

.nav-sidebar.collapsed .nav-toggle {
  margin: 0 auto;
}

.nav-toggle:hover {
  background: var(--border-color);
}

.nav-menu {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-link {
  display: flex;
  align-items: center;
  justify-content: flex-start; /* 确保左对齐 */
  padding: 0.75rem 1rem;
  border-radius: 8px;
  text-decoration: none;
  color: var(--text-muted);
  gap: 1rem;
  overflow: hidden;
  white-space: nowrap;
  height: 40px; /* 固定高度与toggle对齐 */
  box-sizing: border-box;
  transition: all 0.2s ease;
}

.nav-link i {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
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

.nav-sidebar.collapsed .nav-text {
  opacity: 0;
  width: 0;
  visibility: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-sidebar.collapsed .nav-link {
  justify-content: center;
  padding: 0.75rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 确保图标在收起状态下居中对齐 */
.nav-sidebar.collapsed .nav-link i {
  margin: 0;
}

/* 展开状态下的文本过渡 */
.nav-text {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
}
</style>