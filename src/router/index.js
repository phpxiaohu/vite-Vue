import { createRouter, createWebHistory } from 'vue-router'
import { getStore } from '@/stores/'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: () => import('@/page/HelloWorld.vue'), meta: { title: '首页' } },
    { path: '/about', name: 'about', component: () => import('@/page/AboutView.vue'), meta: { title: '添加列表' } },
    { path: '/imgPica', name: 'imgPica', component: () => import('@/page/ImgPica.vue'), meta: { title: '图片压缩' } },
    { path: '/positionStiky', name: 'positionStiky', component: () => import('@/page/PositionStiky.vue'), meta: { title: '商品列表' } },
    { path: '/audioCall', name: 'AudioCall', component: () => import('@/page/AudioCall.vue'), meta: { title: '语言通话' } },
    { path: '/mediaRecorder', name: 'MediaRecorder', component: () => import('@/page/MediaRecorder.vue'), meta: { title: '录音功能' } },
    { path: '/sudoku', name: 'Sudoku', component: () => import('@/page/Sudoku.vue'), meta: { title: '数独游戏' } },
    { path: '/buyerInfo', name: 'buyerInfo', component: () => import('@/page/BuyerInfo.vue'), meta: { title: '实时消息推送' } },
    { path: '/ruleTrace', name: 'ruleTrace', component: () => import('@/page/RuleTraceView.vue'), meta: { title: '规则应用路径' } },
    { path: '/login', name: 'login', component: () => import('@/page/login.vue'), meta: { title: '登录' } },
    { path: '/dataScreen', name: 'dataScreen', component: () => import('@/page/DataScreen.vue'), meta: { title: '数字大屏' } },
    // 捕获所有未匹配的路由，重定向到登录页
    { path: '/:pathMatch(.*)*', redirect: '/login' },
  ],
})

// 拦截路由
router.beforeEach((to, from, next) => {
  const userStore = getStore('useUserStore')

  // 判断路由是否匹配（排除重定向路由）
  const isMatched = to.matched.length > 0
  
  // 如果路由未匹配，直接跳转到登录页
  if (!isMatched && to.path !== '/login') {
    next('/login')
    return
  }

  // 判断用户是否登录
  if (userStore.token) {
    // 已登录
    if (to.path === '/login') {
      // 访问登录页面，跳转到首页
      next('/')
    } else {
      // 访问其他页面，正常跳转
      next()
    }
  } else {
    // 未登录
    if (to.path === '/login') {
      // 访问登录页面，正常跳转
      next()
    } else {
      // 访问其他页面，跳转到登录页面
      next('/login')
    }
  }
})
// 导航守卫
router.afterEach((to, from, failure) => {
  document.title = `${to.meta.title}-Vite-vue`
})

export default router
