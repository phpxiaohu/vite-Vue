<template>
  <div class="flexitemv audio-call-container">
    <div class="call-card">
      <div class="caller-info">
        <div class="avatar">
          <span v-if="callStatus === 'calling'">📞</span>
          <span v-else-if="callStatus === 'connected'">🎙️</span>
          <span v-else>👤</span>
        </div>
        <h2 class="caller-name">{{ callerName }}</h2>
        <p class="call-status">{{ statusText }}</p>
      </div>

      <div class="call-controls">
        <div v-if="callStatus === 'idle'" class="control-group">
          <input
            v-model="targetUserId"
            type="text"
            placeholder="输入对方用户 ID"
            class="user-input"
          />
          <button @click="startCall" class="btn btn-call">
            发起通话
          </button>
        </div>

        <div v-if="callStatus === 'incoming'" class="control-group">
          <p class="incoming-text">来电：{{ callerName }}</p>
          <div class="buttons">
            <button @click="acceptCall" class="btn btn-answer">
              接听
            </button>
            <button @click="rejectCall" class="btn btn-reject">
              挂断
            </button>
          </div>
        </div>

        <div v-if="callStatus === 'connected' || callStatus === 'calling'" class="control-group">
          <button @click="toggleMute" class="btn btn-control" :class="{ active: isMuted }">
            {{ isMuted ? '取消静音' : '静音' }}
          </button>
          <button @click="endCall" class="btn btn-hangup">
            挂断
          </button>
        </div>
      </div>

      <div class="call-timer" v-if="callStatus === 'connected'">
        通话时长：{{ formattedDuration }}
      </div>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: 'AudioCall' })
import { inject, ref, computed, onMounted, onUnmounted } from 'vue'
import { getStore } from '@/stores'
const { userInfo } = getStore('useUserStore') // 用户信息 store

const targetUserId = ref('')
const callerName = ref('未知用户')
const callStatus = ref('idle')
const isMuted = ref(false)
const callStartTime = ref(null)
const duration = ref(0)
let durationTimer = null
let ringtoneOscillator = null
let ringbackOscillator = null
let audioContext = null

// WebSocket 连接
let ws = null
const WS_URL = 'wss://xingchen-api.cn-huabei-1.xf-yun.com/v1.1/chat'
// const WS_URL = 'wss://xwcloudapi.weixin.qq.com/'

// WebRTC 相关
let localStream = null
let peerConnection = null
const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
}
// 状态文本
const statusText = computed(() => {
  const statusMap = {
    idle: '就绪',
    calling: '正在呼叫...',
    incoming: '来电',
    connected: '通话中',
    ended: '通话结束'
  }
  return statusMap[callStatus.value] || '未知状态'
})
// 计算通话时长
const formattedDuration = computed(() => {
  const minutes = Math.floor(duration.value/ 60)
  const seconds = duration.value % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})
// 初始化音频上下文
const initAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }
}
// 播放振铃声
const playDialTone = () => {
  initAudioContext()

  if (ringbackOscillator) return

  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(350, audioContext.currentTime)

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)

  const cycleInterval = setInterval(() => {
    if (callStatus.value !== 'calling') {
      clearInterval(cycleInterval)
      return
    }

    const time = audioContext.currentTime
    gainNode.gain.cancelScheduledValues(time)
    gainNode.gain.setValueAtTime(0.3, time)
    gainNode.gain.setValueAtTime(0, time + 1)
    gainNode.gain.setValueAtTime(0, time + 2)
  }, 2000)

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)
  oscillator.start()

  ringbackOscillator = { oscillator, gainNode, interval: cycleInterval }
}
// 停止振铃声
const stopDialTone = () => {
  if (ringbackOscillator) {
    const { oscillator, gainNode, interval } = ringbackOscillator

    if (interval) {
      clearInterval(interval)
    }

    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.1)

    setTimeout(() => {
      oscillator.stop()
      ringbackOscillator = null
    }, 100)
  }
}
// 播放连接声
const playConnectTone = () => {
  initAudioContext()

  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(600, audioContext.currentTime)
  oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.2)

  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.start()
  oscillator.stop(audioContext.currentTime + 0.3)
}
// 播放挂断声
const playHangupTone = () => {
  initAudioContext()

  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(400, audioContext.currentTime)
  oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.3)

  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.start()
  oscillator.stop(audioContext.currentTime + 0.3)
}
// 播放拒绝声
const playRejectTone = () => {
  initAudioContext()

  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.type = 'sawtooth'
  oscillator.frequency.setValueAtTime(300, audioContext.currentTime)
  oscillator.frequency.linearRampToValueAtTime(200, audioContext.currentTime + 0.2)

  gainNode.gain.setValueAtTime(0.08, audioContext.currentTime)
  gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2)

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.start()
  oscillator.stop(audioContext.currentTime + 0.2)
}
// 初始化 WebSocket
const initWebSocket = () => {
  try {
    ws = new WebSocket(WS_URL)

    ws.onopen = () => {
      console.log('✅ WebSocket 连接成功')
      sendMessage({
        type: 'register',
        userId: getCurrentUserId()
      })
    }

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      handleSignalingMessage(message)
    }

    ws.onclose = () => {
      console.log('❌ WebSocket 连接关闭')
    }

    ws.onerror = (error) => {
      console.error('❌ WebSocket 错误:', error)
    }
  } catch (error) {
    console.error('❌ WebSocket 初始化失败:', error)
  }
}
// 处理信令消息
const handleSignalingMessage = async (message) => {
  console.log('📨 收到信令消息:', message)

  switch (message.type) {
    case 'offer':
  // switch (message.header.code) {
    // case 10004:
      // 接收通话
      await handleOffer(message)
      break
    case 'answer':
      // 接收应答
      await handleAnswer(message)
      break
    case 'ice-candidate':
      await handleIceCandidate(message)
      break
    case 'reject':
      rejectCall()
      break
    case 'hangup':
      handleRemoteHangup()
      break
  }
}
// 发送信令消息
const sendMessage = (message) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message))
  } else {
    console.error('❌ WebSocket 未连接')
  }
}
// 获取当前用户 ID
const getCurrentUserId = () => {
  const { node_id } = userInfo.value
  return node_id
}
// 发起通话
const startCall = async () => {
  if (!targetUserId.value) {
    alert('请输入对方用户 ID')
    return
  }

  try {
    callStatus.value = 'calling'
    callerName.value = targetUserId.value
    // 播放拨号声
    playDialTone()
    // 获取本地媒体流
    await getLocalStream()
    // 创建 RTCPeerConnection
    createPeerConnection()

    localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream)
    })

    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)
    // 发送信令消息
    sendMessage({
      type: 'offer',
      from: getCurrentUserId(),
      to: targetUserId.value,
      sdp: offer.sdp
    })
    // 60 秒后结束通话
    setTimeout(endCall, 60000);
  } catch (error) {
    console.error('❌ 发起通话失败:', error)
    alert('发起通话失败：' + error.message)
    // 结束通话
    endCall()
  }
}
// 接收通话
const handleOffer = async (message) => {
  try {
    callStatus.value = 'incoming'
    callerName.value = message.from

    playDialTone()

    const remoteDescription = new RTCSessionDescription({
      type: 'offer',
      sdp: message.sdp
    })

    await getLocalStream()
    createPeerConnection()

    localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream)
    })

    await peerConnection.setRemoteDescription(remoteDescription)

    const answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)

    sendMessage({
      type: 'answer',
      from: getCurrentUserId(),
      to: message.from,
      sdp: answer.sdp
    })
  } catch (error) {
    console.error('❌ 处理 Offer 失败:', error)
  }
}
// 接收应答
const handleAnswer = async (message) => {
  try {
    stopDialTone()

    const remoteDescription = new RTCSessionDescription({
      type: 'answer',
      sdp: message.sdp
    })
    await peerConnection.setRemoteDescription(remoteDescription)
    callStatus.value = 'connected'
    playConnectTone()
    startTimer()
  } catch (error) {
    console.error('❌ 处理 Answer 失败:', error)
  }
}
// 添加 ICE Candidate
const handleIceCandidate = async (message) => {
  try {
    if (peerConnection) {
      const candidate = new RTCIceCandidate({
        sdpMLineIndex: message.sdpMLineIndex,
        candidate: message.candidate
      })
      await peerConnection.addIceCandidate(candidate)
    }
  } catch (error) {
    console.error('❌ 添加 ICE Candidate 失败:', error)
  }
}
// 挂断通话
const handleRemoteHangup = () => {
  playHangupTone()
  setTimeout(() => {
    alert('对方已挂断')
  }, 300)
  endCall()
}
// 接听通话
const acceptCall = async () => {
  try {
    stopDialTone()  // 停止振铃声

    await getLocalStream()  // 获取本地音频流
    createPeerConnection()  // 创建 RTCPeerConnection

    localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream)
    })

    const answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)

    sendMessage({
      type: 'answer',
      from: getCurrentUserId(),
      to: targetUserId.value || callerName.value,
      sdp: answer.sdp
    })

    callStatus.value = 'connected'  // 更新状态为通话中
    playConnectTone()  // 播放接通提示音
    startTimer()  // 开始计时通话时长
  } catch (error) {
    console.error('❌ 接听失败:', error)
    alert('接听失败：' + error.message)
  }
}
// 拒绝通话
const rejectCall = () => {
  sendMessage({
    type: 'reject',
    from: getCurrentUserId(),
    to: callerName.value
  })
  playRejectTone()
  endCall()
}
// 结束通话
const endCall = () => {
  stopDialTone()

  if (callStatus.value === 'connected' || callStatus.value === 'calling') {
    sendMessage({
      type: 'hangup',
      from: getCurrentUserId(),
      to: targetUserId.value || callerName.value
    })
  }

  // 关闭 RTCPeerConnection
  if (peerConnection) {
    peerConnection.close()
    peerConnection = null
  }

  // 停止所有本地媒体流轨道（包括录音）
  if (localStream) {
    localStream.getTracks().forEach(track => {
      track.stop()
      track.enabled = true
    })
    localStream = null
  }

  callStatus.value = 'ended'
  isMuted.value = false
  stopTimer()
  playHangupTone()

  setTimeout(() => {
    callStatus.value = 'idle'
    callerName.value = '未知用户'
    duration.value = 0
    callStartTime.value = null
  }, 2000)
}
// 静音
const toggleMute = () => {
  if (localStream) {
    const audioTrack = localStream.getAudioTracks()[0]
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled
      isMuted.value = !audioTrack.enabled
    }
  }
}
// 获取本地音频流
const getLocalStream = async () => {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      },
      video: false
    })
    console.log('✅ 获取本地音频流成功')
  } catch (error) {
    console.error('❌ 获取麦克风权限失败:', error)
    throw new Error('无法访问麦克风，请检查权限设置')
  }
}
// 创建 RTCPeerConnection
const createPeerConnection = () => {
  peerConnection = new RTCPeerConnection(RTC_CONFIG)
  // 处理 ICE 候选项
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      sendMessage({
        type: 'ice-candidate',
        from: getCurrentUserId(),
        to: targetUserId.value || callerName.value,
        sdpMLineIndex: event.candidate.sdpMLineIndex,
        candidate: event.candidate.candidate
      })
    }
  }
  // 处理连接状态变化
  peerConnection.onconnectionstatechange = () => {
    console.log('🔌 连接状态变化:', peerConnection.connectionState)
    if (peerConnection.connectionState === 'disconnected' ||
      peerConnection.connectionState === 'failed') {
      handleRemoteHangup()
    }
  }
  // 处理远程音频流
  peerConnection.ontrack = (event) => {
    console.log('🎵 收到远程音频流')
    const audio = new Audio()
    audio.srcObject = event.streams[0]
    audio.autoplay = true
    audio.play()
  }
}
// 开始计时通话时长
const startTimer = () => {
  callStartTime.value = Date.now()
  duration.value = 0
  durationTimer = setInterval(() => {
    duration.value = Math.floor((Date.now() - callStartTime.value) / 1000)
  }, 1000)
}
// 停止计时通话时长
const stopTimer = () => {
  if (durationTimer) {
    clearInterval(durationTimer)
    durationTimer = null
  }
}

onMounted(() => {
  initWebSocket()
})

onUnmounted(() => {
  stopTimer()
  stopDialTone()

  // 确保停止所有媒体流轨道
  if (localStream) {
    localStream.getTracks().forEach(track => {
      track.stop()
      track.enabled = true
    })
    localStream = null
  }

  if (peerConnection) {
    peerConnection.close()
    peerConnection = null
  }

  if (ws) {
    ws.close()
    ws = null
  }

  if (audioContext) {
    audioContext.close()
    audioContext = null
  }
})
</script>

<style scoped>
.audio-call-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.call-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.caller-info {
  margin-bottom: 40px;
}

.avatar {
  font-size: 80px;
  margin-bottom: 20px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.caller-name {
  font-size: 24px;
  color: #333;
  margin: 10px 0;
  font-weight: 600;
}

.call-status {
  font-size: 16px;
  color: #666;
  margin: 5px 0;
}

.call-controls {
  margin: 30px 0;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.user-input {
  padding: 12px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.3s;
}

.user-input:focus {
  border-color: #667eea;
}

.buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.btn {
  padding: 15px 30px;
  border: none;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  outline: none;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.btn:active {
  transform: translateY(0);
}

.btn-call {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-answer {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
}

.btn-reject {
  background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
  color: white;
}

.btn-hangup {
  background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
  color: white;
  width: 100%;
}

.btn-control {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.btn-control.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.incoming-text {
  font-size: 18px;
  color: #333;
  margin: 10px 0;
}

.call-timer {
  margin-top: 20px;
  font-size: 18px;
  color: #667eea;
  font-weight: 600;
}
</style>