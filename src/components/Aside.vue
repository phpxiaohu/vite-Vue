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
  background: var(--xh-bg-secondary);
  transition: width .25s ease;
  padding: 8px;
}

.aside .collapse-btn {
  width: 100%;
  height: 34px;
  border-radius: 6px;
  background: var(--xh-primary-color);
  color: var(--xh-text-white);
  cursor: pointer;
  border: none;
}

.aside.collapsed .collapse-btn {
  font-size: 12px;
}
</style>