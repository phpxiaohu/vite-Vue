<template>
  <div class="position-stiky">
    <div @click="toPage" class="navbar">🍍navbar</div>
    <div class="nav">
      <div class="nav-item">nav-item🍍</div>
    </div>
    <div class="product-container">
      <!-- 错误信息 -->
      <div v-if="error" class="error">{{ error }}</div>
      <!-- 商品列表 -->
      <template v-else-if="productList.length">
        <div class="product-list">
          <div @click="getGoodsDetail(product.id)" v-for="product in productList" :key="product.id" class="product-card">
            <!-- 商品图片 -->
            <div class="product-image">
              <img :src="product.image || '/default-product.png'" :alt="product.name" loading="lazy"/>
            </div>
            <!-- 商品信息 -->
            <div class="product-info">
              <h3 class="product-name">{{ product.name }}</h3>
              <p class="product-description">{{ product.description }}</p>

              <div class="product-details">
                <div class="price-stock">
                  <span class="price">¥{{ product.price }}</span>
                  <span class="stock" :class="{ 'low-stock': product.stock < 10 }">
                库存: {{ product.stock }}
              </span>
                </div>

                <div class="time-info">
                  <small>创建时间: {{ formatDate(product.created_at) }}</small>
                  <small>更新时间: {{ formatDate(product.updated_at) }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="hasMore" ref="hasMore">{{ pagetion.hasMore ? '加载中...' : '加载完了' }}</div>
      </template>
      <!-- 空状态 -->
      <div class="empty" v-else>暂无商品数据</div>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: 'PositionStiky' })
import { inject, ref, onMounted, onUnmounted } from 'vue'
import { products } from "@/api/goods.js"

const navigateTo = inject('navigateTo')
// 响应式数据
const productList = ref([])
const pagetion = ref({})
const hasMore = ref('')
const loading = ref(false)
const error = ref(null)
const observer = ref(null)

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取商品列表
const getGoodsList = async (params = {}) => {
  loading.value = true
  products(params).then(({ data, pagination }) => {
    productList.value.push(...data)
    pagetion.value = pagination || {}
    // 清空错误信息
    error.value = null
  }).catch(({ message }) => {
    error.value = message || '获取商品列表失败'
  }).finally(() => {
    loading.value = false
    !observer.value && isIntersecting()
  })
}

// 获取商品详情
const getGoodsDetail = async (id) => {
  products(id).then(({ data }) => {
    return data
  }).catch(({ message }) => {
    error.value = message || '获取商品详情失败'
  })
  navigateTo('/ruleTrace')
}

// 滚动监听 .loading 是否在可视范围
const isIntersecting = () => {
  observer.value = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !loading.value) {
      if (pagetion.value.hasMore) {
        getGoodsList(pagetion.value)
      } else {
        // 没有更多数据，销毁监听
        observer.value?.disconnect()
        observer.value = null
      }
    }
  }, { root: null, rootMargin: '0px', threshold: 0.1 })

  // 监听
  hasMore.value && observer.value.observe(hasMore.value)
}

// 跳转页面
const toPage = () => {
  navigateTo('/petAdoption')
}

onMounted(() => {
  getGoodsList()
})
// 组件卸载时清理 observer
onUnmounted(() => {
  if (observer.value) {
    observer.value.disconnect()
    observer.value = null
  }
})
</script>

<style scoped>
.position-stiky {
  overflow: auto;
  .navbar {
    height: 50px;
    background: var(--xh-bg-color);
  }
  .nav {
    position: sticky;
    top: 0;
    height: 30px;
    background: var(--xh-text-color);
    z-index: 1;
  }
}

.product-container {
  padding: 14px 14px 0;
}

.hasMore, .empty, .error {
  text-align: center;
  padding: 10px;
  font-size: 16px;
  color: var(--xh-text-secondary);
}

.product-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
}

.product-card {
  background: var(--xh-bg-card);
  border-radius: 8px;
  box-shadow: 0 2px 8px var(--xh-shadow-color);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 16px var(--xh-shadow-hover);
}

.product-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: var(--xh-bg-secondary);
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  padding: 12px;
}

.product-name {
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 10px 0;
  color: var(--xh-text-color);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-description {
  font-size: 14px;
  color: var(--xh-text-color);
  margin: 0 0 15px 0;
  height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-details {
  border-top: 1px solid var(--xh-border-light);
  padding-top: 15px;
}

.price-stock {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.price {
  font-size: 20px;
  font-weight: bold;
  color: var(--xh-error-color);
}

.stock {
  font-size: 14px;
  color: var(--xh-success-color);
}

.stock.low-stock {
  color: var(--xh-error-color);
}

.time-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.time-info small {
  font-size: 12px;
  color: var(--xh-text-light);
}
</style>