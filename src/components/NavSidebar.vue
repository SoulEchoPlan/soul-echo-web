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
  flex: 0 0 240px; /* 默认宽度 240px */
  background-color: var(--panel-bg);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  box-shadow: var(--shadow);
}

.nav-sidebar.collapsed {
  flex: 0 0 80px; /* 收缩后宽度 80px */
}

.nav-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
}

.nav-toggle {
  background: var(--secondary-bg);
  border-radius: 8px;
  padding: 0.5rem;
  cursor: pointer;
}
.nav-toggle:hover {
  background: var(--border-color);
}

.nav-menu {
  list-style: none;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  border-radius: 8px;
  text-decoration: none;
  color: var(--text-muted);
  gap: 1rem;
  overflow: hidden;
  white-space: nowrap;
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
}
.nav-sidebar.collapsed .nav-link {
  justify-content: center;
}
</style>