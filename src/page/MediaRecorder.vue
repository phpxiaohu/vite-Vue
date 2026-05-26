<template>
  <div class="media-recorder-container">
    <h2>通话录音</h2>

    <div class="controls">
      <button
        @click="startRecording"
        :disabled="isRecording"
        class="btn-start"
      >开始录音</button>
      <button
        @click="stopRecording"
        :disabled="!isRecording"
        class="btn-stop"
      >停止录音</button>
      <button
        @click="downloadBlob"
        :disabled="!audioBlob"
        class="btn-download"
      >下载录音</button>
    </div>

    <div class="status">
      <p>状态：{{ statusText }}</p>
      <p v-if="recordingTime">录音时长：{{ recordingTime }}s</p>
      <p v-if="audioBlob">录音大小：{{ audioSize }}</p>
    </div>

    <div class="audio-player" v-if="audioUrl">
      <h3>录音预览</h3>
      <audio :src="audioUrl" controls></audio>
    </div>

    <button @click="navigateTo('/sudoku')">sudoku</button>
  </div>
</template>

<script setup>
defineOptions({ name: 'MediaRecorder' })
import { ref, computed, inject, onUnmounted } from 'vue'
const navigateTo = inject('navigateTo'); // 注入路由方法
import { getStore } from '@/stores'
const { userInfo } = getStore('useUserStore') // 创建用户 store
const mediaRecorder = ref(null) // 媒体记录器实例
const audioChunks = ref([]) // 录音数据块
const audioBlob = ref(null) // 录音文件 blob
const audioUrl = ref(null) // 录音文件 URL
const isRecording = ref(false) // 是否正在录音
const statusText = ref('未开始') // 录音状态文本
const recordingTime = ref(0) // 录音时长
const timer = ref(null) // 计时器 ID

// 计算录音文件大小
const audioSize = computed(() => {
  if (!audioBlob.value) return ''
  const size = audioBlob.value.size
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`
  return `${(size / (1024 * 1024)).toFixed(2)} MB`
})

// 开始录音
const startRecording = async () => {
  try {
    // 请求麦克风权限
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false
    })

    // 创建 MediaRecorder 实例
    mediaRecorder.value = new MediaRecorder(stream)
    audioChunks.value = []

    // 监听数据可用事件
    mediaRecorder.value.ondataavailable = ({ data }) => {
      if (data.size > 0) {
        audioChunks.value.push(data)
      }
    }

    // 监听录音停止事件
    mediaRecorder.value.onstop = () => {
      // 将录音数据转换为 blob
      audioBlob.value = new Blob(audioChunks.value, {
        type: 'audio/webm'
      })
      audioUrl.value = URL.createObjectURL(audioBlob.value)
      statusText.value = '录音完成'
      isRecording.value = false

      // 停止所有音轨
      stream.getTracks().forEach(track => track.stop())

      // 清除定时器
      if (timer.value) {
        clearInterval(timer.value)
        timer.value = null
      }
    }

    // 开始录音
    mediaRecorder.value.start()
    isRecording.value = true
    statusText.value = '录音中...'
    recordingTime.value = 0

    // 启动计时器
    timer.value = setInterval(() => {
      recordingTime.value++
    }, 1000)

  } catch (error) {
    console.error('获取麦克风权限失败:', error)
    statusText.value = '错误：无法访问麦克风'
  }
}

// 停止录音
const stopRecording = () => {
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop()
  }
}

// 下载 blob 文件
const downloadBlob = () => {
  if (!audioBlob.value) return

  // 创建下载链接
  const url = URL.createObjectURL(audioBlob.value)
  const a = document.createElement('a')
  a.href = url
  a.download = `${userInfo.value.name}-${new Date().getTime()}.mp3`
  a.click()

  requestIdleCallback(() => {
    URL.revokeObjectURL(url) // 释放 URL
  }, { timeout: 500 })
}

// 组件卸载时清理资源
onUnmounted(() => {
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop()
  }
  if (timer.value) {
    clearInterval(timer.value)
  }
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value)
  }
  // 清空音频数据
  audioBlob.value = null
  audioChunks.value = []
})
</script>

<style scoped>
.media-recorder-container {
  max-width: 600px;
  margin: 50px auto;
  padding: 30px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.controls {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  justify-content: center;
}

button {
  padding: 12px 24px;
  font-size: 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-start {
  background: #4CAF50;
  color: white;
}

.btn-start:hover:not(:disabled) {
  background: #45a049;
}

.btn-stop {
  background: #f44336;
  color: white;
}

.btn-stop:hover:not(:disabled) {
  background: #da190b;
}

.btn-download {
  background: #2196F3;
  color: white;
}

.btn-download:hover:not(:disabled) {
  background: #0b7dda;
}

.status {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
  text-align: left;
}

.status p {
  margin: 8px 0;
  color: #333;
}

.audio-player {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ddd;
}

.audio-player h3 {
  margin-bottom: 15px;
  color: #333;
}

.audio-player audio {
  width: 100%;
}
</style>