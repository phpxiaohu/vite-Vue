<!-- src/page/ErrorLog.vue -->
<template>
  <div class="error-log-container">
    <h2>🐛 错误日志监控</h2>

    <div class="actions">
      <button @click="loadErrors" class="btn btn-primary">🔄 刷新日志</button>
      <button @click="clearErrors" class="btn btn-danger">🗑️ 清空日志</button>
      <button @click="exportErrors" class="btn btn-success">📥 导出日志</button>
    </div>

    <div class="stats">
      <div class="stat-item">
        <span class="label">总错误数:</span>
        <span class="value">{{ errors.length }}</span>
      </div>
      <div class="stat-item">
        <span class="label">运行时错误:</span>
        <span class="value">{{ errorStats.runtime }}</span>
      </div>
      <div class="stat-item">
        <span class="label">Promise 错误:</span>
        <span class="value">{{ errorStats.promise }}</span>
      </div>
      <div class="stat-item">
        <span class="label">资源错误:</span>
        <span class="value">{{ errorStats.resource }}</span>
      </div>
      <div class="stat-item">
        <span class="label">Vue 错误:</span>
        <span class="value">{{ errorStats.vue }}</span>
      </div>
    </div>

    <div class="filter-bar">
      <label>筛选类型：</label>
      <select v-model="filterType" class="filter-select">
        <option value="all">全部</option>
        <option value="runtime_error">运行时错误</option>
        <option value="unhandled_rejection">Promise 错误</option>
        <option value="resource_error">资源错误</option>
        <option value="vue_error">Vue 错误</option>
      </select>
    </div>

    <div class="error-list">
      <div v-if="filteredErrors.length === 0" class="empty-state">
        <p>暂无错误日志 🎉</p>
      </div>

      <div v-for="(error, index) in reversedErrors" :key="index" class="error-item">
        <div class="error-header">
          <div class="error-type-wrapper">
            <span class="error-type" :class="error.type">{{ getTypeLabel(error.type) }}</span>
            <span class="error-index">#{{ errors.length - index }}</span>
          </div>
          <span class="error-time">{{ formatTime(error.timestamp) }}</span>
        </div>

        <div class="error-message">{{ error.message }}</div>

        <!-- 页面信息 -->
        <div class="error-section">
          <details>
            <summary>📍 页面信息</summary>
            <div class="section-content">
              <div class="info-grid">
                <div><strong>URL:</strong> {{ error.page?.url }}</div>
                <div><strong>路径:</strong> {{ error.page?.path }}</div>
                <div><strong>标题:</strong> {{ error.page?.title }}</div>
                <div><strong>来源:</strong> {{ error.page?.referrer || '直接访问' }}</div>
              </div>
            </div>
          </details>
        </div>

        <!-- 设备信息 -->
        <div class="error-section">
          <details>
            <summary>💻 设备信息</summary>
            <div class="section-content">
              <div class="info-grid">
                <div><strong>浏览器:</strong> {{ error.device?.browser?.name }} {{ error.device?.browser?.version }}</div>
                <div><strong>系统:</strong> {{ error.device?.os?.name }} {{ error.device?.os?.version }}</div>
                <div><strong>屏幕:</strong> {{ error.device?.screen?.width }}x{{ error.device?.screen?.height }}</div>
                <div><strong>视口:</strong> {{ error.device?.viewport?.width }}x{{ error.device?.viewport?.height }}</div>
                <div><strong>语言:</strong> {{ error.device?.language }}</div>
                <div><strong>CPU 核心:</strong> {{ error.device?.hardwareConcurrency }}</div>
              </div>
            </div>
          </details>
        </div>

        <!-- 网络状态 -->
        <div class="error-section">
          <details>
            <summary>🌐 网络状态</summary>
            <div class="section-content">
              <div class="info-grid">
                <div><strong>在线状态:</strong> {{ error.network?.online ? '✅ 在线' : '❌ 离线' }}</div>
                <div><strong>网络类型:</strong> {{ error.network?.type }}</div>
                <div><strong>网络质量:</strong> {{ error.network?.effectiveType }}</div>
                <div><strong>下行速度:</strong> {{ error.network?.downlink }} Mbps</div>
                <div><strong>延迟:</strong> {{ error.network?.rtt }} ms</div>
              </div>
            </div>
          </details>
        </div>

        <!-- 用户操作轨迹 -->
        <div v-if="error.userActions && error.userActions.length > 0" class="error-section">
          <details>
            <summary>👆 用户操作轨迹 ({{ error.userActions.length }})</summary>
            <div class="section-content">
              <div class="action-list">
                <div v-for="(action, idx) in error.userActions" :key="idx" class="action-item">
                  <span class="action-time">{{ formatShortTime(action.timestamp) }}</span>
                  <span class="action-type">{{ getActionLabel(action.type) }}</span>
                  <span class="action-detail">{{ getActionDetail(action) }}</span>
                </div>
              </div>
            </div>
          </details>
        </div>

        <!-- 堆栈信息 -->
        <div v-if="error.stack" class="error-section">
          <details>
            <summary>📋 堆栈信息</summary>
            <div class="section-content">
              <pre class="stack-trace">{{ error.stack }}</pre>
            </div>
          </details>
        </div>

        <!-- 文件位置 -->
        <div v-if="error.filename" class="error-meta">
          <span>📁 {{ error.filename }}:{{ error.lineno }}:{{ error.colno }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import errorMonitor from '@/utils/errorMonitor'

const errors = ref([])
const filterType = ref('all')

const reversedErrors = computed(() => {
  return [...filteredErrors.value].reverse()
})

const filteredErrors = computed(() => {
  if (filterType.value === 'all') {
    return errors.value
  }
  return errors.value.filter(e => e.type === filterType.value)
})

const errorStats = computed(() => {
  return {
    runtime: errors.value.filter(e => e.type === 'runtime_error').length,
    promise: errors.value.filter(e => e.type === 'unhandled_rejection').length,
    resource: errors.value.filter(e => e.type === 'resource_error').length,
    vue: errors.value.filter(e => e.type === 'vue_error').length
  }
})

const loadErrors = () => {
  errors.value = errorMonitor.getRecentErrors(100)
}

const clearErrors = () => {
  if (confirm('确定要清空所有错误日志吗？')) {
    errorMonitor.clearErrors()
    errors.value = []
  }
}

const exportErrors = () => {
  const report = errorMonitor.exportErrors()
  const dataStr = JSON.stringify(report, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `error-log-${Date.now()}.json`
  link.click()
  URL.revokeObjectURL(url)
}

const getTypeLabel = (type) => {
  const labels = {
    runtime_error: '运行时错误',
    unhandled_rejection: 'Promise 错误',
    resource_error: '资源错误',
    vue_error: 'Vue 错误'
  }
  return labels[type] || type
}

const getActionLabel = (type) => {
  const labels = {
    click: '🖱️ 点击',
    keydown: '⌨️ 按键',
    input: '📝 输入',
    scroll: '📜 滚动'
  }
  return labels[type] || type
}

const getActionDetail = (action) => {
  if (action.type === 'click') {
    return `${action.target?.tag} ${action.target?.text?.substring(0, 20) || ''}`
  }
  if (action.type === 'keydown') {
    return `按键: ${action.key}`
  }
  if (action.type === 'input') {
    return `${action.target?.tag}[${action.target?.name || action.target?.id}]`
  }
  if (action.type === 'scroll') {
    return `滚动到: ${action.scrollY}px`
  }
  return ''
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const formatShortTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

onMounted(() => {
  loadErrors()
})
</script>

<style scoped>
.error-log-container {
  padding: 10px;
  background: #f5f7fa;
}

h2 {
  margin-bottom: 20px;
  color: #333;
  font-size: 24px;
}

.actions {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  font-weight: 500;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn-primary {
  background: #1890ff;
  color: white;
}

.btn-danger {
  background: #ff4d4f;
  color: white;
}

.btn-success {
  background: #52c41a;
  color: white;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.stat-item {
  background: white;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stat-item .label {
  color: #666;
  font-size: 14px;
}

.stat-item .value {
  color: #333;
  font-size: 24px;
  font-weight: bold;
}

.filter-bar {
  background: white;
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.error-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #999;
  font-size: 16px;
  background: white;
  border-radius: 8px;
}

.error-item {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-left: 4px solid #ff4d4f;
}

.error-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.error-type-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.error-type {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.error-type.runtime_error {
  background: #fff1f0;
  color: #cf1322;
  border: 1px solid #ffa39e;
}

.error-type.unhandled_rejection {
  background: #fff7e6;
  color: #d46b08;
  border: 1px solid #ffd591;
}

.error-type.resource_error {
  background: #f9f0ff;
  color: #531dab;
  border: 1px solid #d3adf7;
}

.error-type.vue_error {
  background: #e6f7ff;
  color: #0958d9;
  border: 1px solid #91d5ff;
}

.error-index {
  color: #999;
  font-size: 12px;
  font-weight: bold;
}

.error-time {
  color: #999;
  font-size: 13px;
}

.error-message {
  color: #333;
  font-size: 15px;
  margin-bottom: 15px;
  line-height: 1.6;
  padding: 12px;
  background: #fafafa;
  border-radius: 4px;
  border-left: 3px solid #ff4d4f;
}

.error-section {
  margin-bottom: 10px;
}

.error-section details {
  background: #fafafa;
  border-radius: 4px;
  border: 1px solid #e8e8e8;
}

.error-section summary {
  cursor: pointer;
  padding: 10px 15px;
  font-size: 13px;
  color: #1890ff;
  user-select: none;
  font-weight: 500;
}

.error-section summary:hover {
  background: #f0f0f0;
}

.section-content {
  padding: 15px;
  border-top: 1px solid #e8e8e8;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 10px;
  font-size: 13px;
}

.info-grid div {
  color: #666;
}

.info-grid strong {
  color: #333;
  margin-right: 5px;
}

.action-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: white;
  border-radius: 4px;
  font-size: 12px;
}

.action-time {
  color: #999;
  min-width: 70px;
}

.action-type {
  min-width: 80px;
  font-weight: 500;
}

.action-detail {
  color: #666;
  flex: 1;
}

.stack-trace {
  background: #282c34;
  color: #abb2bf;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
  line-height: 1.6;
  margin: 0;
}

.error-meta {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #e8e8e8;
  color: #999;
  font-size: 12px;
}
</style>