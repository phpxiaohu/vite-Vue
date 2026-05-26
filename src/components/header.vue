<template>
  <header class="flex shrink justify header">
    <nav>
      <RouterLink to="/">Home</RouterLink>|
      <RouterLink to="/imgPica">imgPica</RouterLink>|
      <RouterLink to="/about">About</RouterLink>|
      <RouterLink to="/positionStiky">positionStiky</RouterLink>|
      <RouterLink to="/errorLog">errorLog</RouterLink>|
      <RouterLink to="/dataScreen">dataScreen</RouterLink>
    </nav>
    <div class="right_btn">
      <label class="theme" for="theme">
        <span>主题: </span>
        <select v-model="theme" @change="handleTheme">
          <option disabled selected hidden>请选择</option>
          <option
            v-for="item of allThemes"
            :value="item"
            :key="item"
          >{{ item }}</option>
        </select>
      </label>
      <label class="logout">
        <button @click="handleLogout">退出登陆</button>
      </label>
    </div>
  </header>
</template>

<script setup>
import { inject, ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { getStore } from '@/stores'
import { logout } from '@/api/user.js'

const redirectTo = inject('redirectTo')
const themeStore = getStore('useThemeStore')
const { clearUserInfo } = getStore('useUserStore')
const theme = ref(themeStore.getCurrentThemeClass.value)
const allThemes = computed(() => themeStore.getAllThemes.value)

const handleTheme = () => {
  themeStore.toggleTheme(theme.value)
}

const handleLogout = () => {
  logout().then(() => {
    clearUserInfo()
    redirectTo('/logins')
  })
}
</script>

<style scoped>
.header {height: 40px;background: var(--xh-bg-color)}
</style>