<template>
  <template v-if="userStore.token">
    <Aside/>
    <div class="flexitemv container">
      <Header/>
      <main class="flexitemv main-body">
        <RouterView/>
      </main>
      <Footer/>
    </div>
  </template>
  <RouterView v-else/>
</template>

<script setup>
import { RouterView, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import Aside from '@/components/aside.vue'
import Header from '@/components/header.vue'
import Footer from '@/components/footer.vue'

const route = useRoute()
const userStore = useUserStore() // 保持响应式

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