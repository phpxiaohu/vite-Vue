<template>
  <div class="aside" :class="{ collapsed: isAsideCollapsed }" :style="{ width: asideWidth }">
    <button class="collapse-btn" type="button" @click="toggleAside">
      {{ isAsideCollapsed ? '展开' : '折叠' }}
    </button>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const isAsideCollapsed = ref(false)
const asideWidth = computed(() => (isAsideCollapsed.value ? '56px' : '200px'))

const toggleAside = () => {
  isAsideCollapsed.value = !isAsideCollapsed.value
}
</script>

<style scoped>
.aside {
  width: 200px;
  flex-shrink: 0;
  background: #b6fd92;
  transition: width .25s ease;
  padding: 8px;
  .collapse-btn {
    width: 100%;
    height: 34px;
    border-radius: 6px;
    background: #3384ee;
    color: #fff;
    cursor: pointer;
  }
  &.collapsed .collapse-btn {
    font-size: 12px;
  }
}
</style>