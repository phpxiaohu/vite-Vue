<template>
  <template v-if="userStore.token">
    <Aside/>
    <div class="flexitemv container">
      <Header/>
      <main class="flexitemv main-body">
        <RouterView v-slot="{ Component }">
          <keep-alive :include="cachedViews">
            <component :is="Component" />
          </keep-alive>
        </RouterView>
      </main>
      <Footer/>
    </div>
  </template>
  <RouterView v-else-if="route.name === 'logins'"/>
  <RouterView v-else/>
</template>

<script setup>
import { ref, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import Aside from '@/components/aside.vue'
import Header from '@/components/header.vue'
import Footer from '@/components/footer.vue'

const route = useRoute()
const userStore = useUserStore() // 保持响应式

// 维护一个持久的缓存列表
const cachedViews = ref([])

// 监听路由变化，将需要缓存的组件名添加到列表
watch(
  () => route.path,
  () => {
    const matchedRoutes = route.matched
    matchedRoutes.forEach(r => {
      if (r.meta?.keepAlive) {
        const componentName = r.components?.default?.name || r.name
        if (componentName && !cachedViews.value.includes(componentName)) {
          cachedViews.value.push(componentName)
        }
      }
    })
  },
  { immediate: true }
)
</script>

<style scoped>
@property --scroll-position {syntax: "<number>";inherits: true;initial-value: 0;}
@property --scroll-position-delayed {syntax: "<number>";inherits: true;initial-value: 0;}
@property --scroll-velocity {syntax: "<number>";inherits: true;initial-value: 0;}
@keyframes adjust-pos {to{--scroll-position: 100;--scroll-position-delayed: 100;}}

.container {
  min-width: 0;
  .main-body {
    overflow: auto;

    animation: adjust-pos 1s linear both;
    animation-timeline: scroll(block self); /*动画时间线*/
    .scroll {
      transition: --scroll-position-delayed 2s linear;
      --scroll-velocity: calc(var(--scroll-position) - var(--scroll-position-delayed));
      --scroll-speed: max(var(--scroll-velocity), -1 * var(--scroll-velocity)); /*取滚动方向绝对值*/
      background: if(style(--scroll-velocity: 0): yellow; else: red);

      counter-reset: scroll-speed calc(var(--scroll-speed) * 1) scroll-velocity calc(var(--scroll-velocity) * 1);
      &::after{
        content: "scroll-speed: " counter(scroll-speed) "| scroll-velocity: " counter(scroll-velocity);
      }
    }
    /* 设置滚动条宽度 */
    ::-webkit-scrollbar {width: 8px;height: 8px;}
    ::-webkit-scrollbar-thumb {background-color: rgba(0, 0, 0, 0.2);border-radius: 4px;}
    ::-webkit-scrollbar-track {background-color: transparent;}
  }
}
</style>