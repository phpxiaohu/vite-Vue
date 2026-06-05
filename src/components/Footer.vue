<template>
  <footer class="flex shrink center footer">{{ userInfo.username }} | footer |</footer>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore) // 保持响应式
</script>

<style scoped>
.footer {
  height: 30px;
  border-top: 1px solid var(--xh-bg-secondary);
  box-shadow: 0 -1px 4px var(--xh-bg-secondary);
  color: var(--xh-text-color);
  background: var(--xh-bg-tertiary);
}
</style>