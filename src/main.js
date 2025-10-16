import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import HomePage from './views/HomePage.vue'
import './style.css'

const app = createApp(HomePage)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')