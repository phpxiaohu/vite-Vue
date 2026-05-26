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
.footer {height: 30px;background: #eee;}
</style>