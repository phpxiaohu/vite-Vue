<template>
  <div class="buyer-info">
    <div class="header">
      <h2>实时消息推送</h2>
      <div class="connection-status" :class="statusClass">
        <span class="status-dot"></span>
        {{ connectionStatus }}
      </div>
    </div>

    <div class="message-container">
      <div class="message-list" ref="messageListRef">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          class="message-item"
          :class="msg.type"
        >
          <span class="message-time">{{ msg.time }}</span>
          <span class="message-content">{{ msg.content }}</span>
        </div>
        <div v-if="messages.length === 0" class="no-messages">
          暂无消息
        </div>
      </div>
    </div>

    <div class="controls">
      <button @click="toggleConnection" :class="{ connecting: isConnecting }">
        {{ isConnected ? '断开连接' : '建立连接' }}
      </button>
      <button @click="clearMessages">清空消息</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

defineOptions({ name: 'BuyerInfo' })

const SSE_URL = 'http://localhost:8080/sse' // SSE 服务器地址，根据实际情况修改

const messages = ref([])
const isConnected = ref(false)
const isConnecting = ref(false)
const reconnectAttempts = ref(0)
const maxReconnectAttempts = ref(5)
const reconnectDelay = ref(3000)

let eventSource = null
let reconnectTimer = null
const messageListRef = ref(null)

const connectionStatus = computed(() => {
  if (isConnecting.value) return '连接中...'
  if (isConnected.value) return '已连接'
  return '已断开'
})

const statusClass = computed(() => {
  if (isConnecting.value) return 'connecting'
  if (isConnected.value) return 'connected'
  return 'disconnected'
})

const formatTime = () => {
  const now = new Date()
  return now.toLocaleTimeString('zh-CN', { hour12: false })
}

const addMessage = (content, type = 'received') => {
  messages.value.push({
    time: formatTime(),
    content,
    type
  })
  scrollToBottom()
}

const scrollToBottom = async () => {
  await nextTick()
  if (messageListRef.value) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight
  }
}

const connect = () => {
  if (eventSource || isConnecting.value) return

  isConnecting.value = true

  try {
    eventSource = new EventSource(SSE_URL)

    eventSource.onopen = () => {
      console.log('SSE 连接成功')
      isConnected.value = true
      isConnecting.value = false
      reconnectAttempts.value = 0
      addMessage('服务器连接成功', 'system')
    }

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.type === 'system') {
          addMessage(data.content, 'system')
        } else if (data.type === 'notification') {
          addMessage(data.content, 'received')
        } else {
          addMessage(event.data, 'received')
        }
      } catch (e) {
        addMessage(event.data, 'received')
      }
    }

    eventSource.onerror = (error) => {
      console.error('SSE 错误:', error)
      isConnected.value = false
      isConnecting.value = false

      if (eventSource.readyState === EventSource.CLOSED) {
        addMessage('连接已关闭', 'error')
      } else if (reconnectAttempts.value < maxReconnectAttempts.value) {
        reconnectAttempts.value++
        addMessage(`尝试重连 (${reconnectAttempts.value}/${maxReconnectAttempts.value})`, 'system')
        reconnectTimer = setTimeout(() => {
          disconnect()
          eventSource = null
          connect()
        }, reconnectDelay.value)
      } else {
        addMessage('已达最大重连次数，请手动重新连接', 'error')
        eventSource.close()
        eventSource = null
      }
    }
  } catch (error) {
    console.error('创建 SSE 连接失败:', error)
    isConnecting.value = false
    addMessage('创建连接失败', 'error')
  }
}

const disconnect = () => {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }

  if (eventSource) {
    eventSource.close()
    eventSource = null
  } else {
    addMessage('已断开连接', 'system')
  }

  isConnected.value = false
  isConnecting.value = false
}

const toggleConnection = () => {
  if (isConnected.value || isConnecting.value) {
    disconnect()
  } else {
    connect()
  }
}

const clearMessages = () => {
  messages.value = []
}

onMounted(() => {
  connect()
})

onUnmounted(() => {
  disconnect()
})
</script>

<style scoped>
.buyer-info {
  padding: 10px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
}

.header h2 {
  margin: 0;
  color: #333;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #95a5a6;
}

.connected {
  background: #d4edda;
  color: #155724;
}

.connected .status-dot {
  background: #28a745;
  animation: pulse 2s infinite;
}

.connecting {
  background: #fff3cd;
  color: #856404;
}

.connecting .status-dot {
  background: #ffc107;
  animation: pulse 1s infinite;
}

.disconnected {
  background: #f8d7da;
  color: #721c24;
}

.disconnected .status-dot {
  background: #dc3545;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.message-container {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 20px;
}

.message-list {
  height: 400px;
  overflow-y: auto;
  padding: 15px;
  background: #fafafa;
}

.no-messages {
  text-align: center;
  color: #999;
  padding: 40px 0;
}

.message-item {
  display: flex;
  gap: 10px;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 6px;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-item.received {
  background: #e3f2fd;
  border-left: 3px solid #2196f3;
}

.message-item.system {
  background: #fff3cd;
  border-left: 3px solid #ffc107;
  font-style: italic;
}

.message-item.error {
  background: #f8d7da;
  border-left: 3px solid #dc3545;
}

.message-time {
  min-width: 70px;
  color: #666;
  font-size: 12px;
  font-weight: 500;
}

.message-content {
  flex: 1;
  color: #333;
  word-break: break-word;
}

.controls {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.controls button {
  padding: 10px 25px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.controls button:hover {
  background: #f5f5f5;
  border-color: #bbb;
}

.controls button.connecting {
  background: #ffc107;
  color: #000;
  border-color: #ffc107;
}
</style>