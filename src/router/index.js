// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import ChatView from '@/views/ChatView.vue'
import KnowledgeBaseView from '@/views/KnowledgeBaseView.vue'
import CharacterManagementView from '@/views/CharacterManagementView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            redirect: '/chat'
        },
        {
            path: '/chat',
            name: 'chat',
            component: ChatView
        },
        {
            path: '/knowledge-base',
            name: 'knowledge-base',
            component: KnowledgeBaseView
        },
        {
            path: '/management',
            name: 'management',
            component: CharacterManagementView
        }
    ]
})

export default router