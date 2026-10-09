import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
// Mock.js 已禁用 —— 改用共享 Express 服务器 (http://localhost:3000)
// 如需恢复 Mock 模式，取消下行注释并停止 server
// import './mock'

const app = createApp(App)
const pinia = createPinia()

app.use(ElementPlus)
app.use(pinia)
app.use(router)
app.mount('#app')
