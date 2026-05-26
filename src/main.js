import '@/assets/css/theme.css'
import '@/assets/css/style.css'
import { createApp } from 'vue'
import App from './App.vue'
import pinia from '@/stores'
import router from '@/router'
import directives from '@/utils/directives' // 注册自定义指令
import { useThemeStore } from '@/stores/theme'
import errorMonitor from '@/utils/errorMonitor'

const app = createApp(App)

app.provide('redirectTo', (path) => router.replace(path)); // 关闭当前页面，跳转到应用内的某个页面
app.provide('navigateTo', (path) => router.push(path)); // 保留当前页面，跳转到应用内的某个页面
app.use(directives).use(pinia).use(router).mount('#app')

// 初始化主题
const themeStore = useThemeStore()
themeStore.initTheme()

// 初始化错误监控
errorMonitor.init({
  // 错误上报接口（可选）
  // reportUrl: '/api/error/report',

  // 是否在控制台输出错误信息
  enableConsole: true,

  // 是否追踪用户操作（点击、输入、滚动等）
  trackUserActions: true,

  // 是否收集性能指标
  collectPerformance: true,

  // 错误发生时的回调
  onError: (errorInfo) => {
    console.log('📊 错误已记录', errorInfo.type)
    console.log('📍 页面信息:', errorInfo.page)
    console.log('💻 设备信息:', errorInfo.device)
    console.log('🌐 网络状态:', errorInfo.network)
    console.log('👆 最近操作:', errorInfo.userActions.slice(-3))
  }
})

// 配置 Vue 错误处理器
app.config.errorHandler = (err, instance, info) => {
  errorMonitor.captureVueError?.(err, instance, info)
}