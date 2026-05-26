<template>
  <div class="about">
    <h2>测试 🍍pinia 模式</h2>
    <form @submit.prevent="addItemToCart" class="login-form">
      <input type="text" v-model.trim="itemName" placeholder="请输入商品名称">
      <button type="submit">添加</button>
    </form>

    <ul class="flexv">
      <li
        v-for="item in cartStore.itemList"
        :key="item.name"
        class="flex centerv shrink">
        <span class="ellipsis">{{ item.name }}</span>
        <button @click="cartStore.removeItem(item)" class="flex shrink">删除</button>
      </li>
    </ul>
    <button @click="clearCart">清空</button>

    <button @click="navigateTo('/')">返回</button>
  </div>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue'
defineOptions({ name: 'AboutView' })
const navigateTo = inject('navigateTo'); // 注入路由方法
import { getStore } from '@/stores'
const cartStore = getStore('useCartStore') // 创建购物车 store
/* 数据 */
const itemName = ref('') // 商品名称
/* 方法 */
// 添加商品到购物车
function addItemToCart() {
  if (itemName.value) {
    cartStore.addItem(itemName.value)
    itemName.value = ''
  } else {
    // 提示
    confirm('商品名称不能为空')
  }
}
// 清空购物车
function clearCart() {
  const confirmed = confirm('确认清空购物车吗?');
  if (confirmed) {
    console.log(cartStore.itemList.value)
    cartStore.clearItem()
  }
  // 监测文件是否更新
  fetch(location.origin, { method: 'HEAD', cache: 'no-store' }).then(res => {
    console.log(res.headers.get('etag'))
  })
}
onMounted(() => {
  // console.log(cartStore.secret, APP_MAC)
})
</script>

<style scoped>
.about {
  margin: 10px;
  padding: 10px;
  input {
    background: #fff;
  }
  li {
    max-width: 300px;
    border-bottom: 1px solid #6ec4ab;
  }
}
</style>