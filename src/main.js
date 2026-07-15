import { createApp } from 'vue'
import App from './App.vue'
import router from '../router'

console.log('API Key loaded:', import.meta.env.VITE_API_KEY)

createApp(App).use(router).mount('#app')
