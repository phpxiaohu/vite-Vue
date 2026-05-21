<template>
  <div class="flex center login">
    <div class="login-box">
      <div class="login-title">
        🍍
        <img alt="logo" src="https://github.githubassets.com/assets/profile-first-repo-fe2c6ecdd20b.svg">
      </div>
      <form @submit.prevent="handleSubmit" v-loading="loading" class="login-form">
        <!-- 登录时显示用户名 -->
        <div v-if="!isRegisterMode" class="login-item">
          <label for="">用户名</label>
          <input v-model.trim="formData.username" class="input" placeholder="请输入用户名" type="text">
        </div>

        <!-- 注册时显示用户名和邮箱 -->
        <template v-if="isRegisterMode">
          <div class="login-item">
            <label for="">用户名</label>
            <input v-model.trim="formData.username" class="input" placeholder="请输入用户名" type="text">
          </div>

          <div class="login-item">
            <label for="">邮箱</label>
            <input v-model.trim="formData.email" class="input" placeholder="请输入邮箱" type="email">
          </div>
        </template>

        <div class="login-item">
          <label for="">密码</label>
          <div class="flex input">
            <input v-model.trim="formData.password" placeholder="请输入密码" :type="showPassword ? 'text' : 'password'">
            <i class="toggle-password" @click="togglePassword">{{ showPassword ? '👁️' : '🙈' }}</i>
          </div>
        </div>

        <!-- 注册时显示确认密码 -->
        <div v-if="isRegisterMode" class="login-item">
          <label for="">确认密码</label>
          <div class="flex input">
            <input v-model.trim="formData.confirmed" placeholder="请再次输入密码" :type="showconfirmed ? 'text' : 'password'">
            <i class="toggle-password" @click="toggleconfirmed">{{ showconfirmed ? '👁️' : '🙈' }}</i>
          </div>
        </div>

        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

        <button type="submit">{{ isRegisterMode ? '注册' : '登录' }}</button>
        <a class="register" @click="toggleMode">{{ isRegisterMode ? '已有账号？去登录' : '没有账号？去注册' }}</a>
      </form>
    </div>
  </div>
</template>

<script setup>
import { inject, reactive, ref } from 'vue'
import { getStore } from '@/stores'
import { login, register } from '@/api/user.js'
defineOptions({ name: 'user' })

const redirectTo = inject('redirectTo')
const { setUserInfo, setToken } = getStore('useUserStore')

const formData = reactive({
  username: '',
  email: '',
  password: '',
  confirmed: ''
})

const loading = ref(false)
const errorMessage = ref('')
const showPassword = ref(false)
const showconfirmed = ref(false)
const isRegisterMode = ref(false)

// 切换密码显示/隐藏
const togglePassword = () => {
  showPassword.value = !showPassword.value
}

// 切换确认密码显示/隐藏
const toggleconfirmed = () => {
  showconfirmed.value = !showconfirmed.value
}

// 切换登录/注册模式
const toggleMode = () => {
  isRegisterMode.value = !isRegisterMode.value
  // 重置表单和错误信息
  errorMessage.value = ''
  if (isRegisterMode.value) {
    // 切换到注册模式时清空密码相关字段
    formData.password = ''
    formData.confirmed = ''
  }
}

const validateForm = () => {
  if (isRegisterMode.value) {
    // 注册模式验证
    if (!formData.email.trim()) {
      errorMessage.value = '请输入邮箱'
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errorMessage.value = '请输入有效的邮箱地址'
      return false
    }
    if (!formData.password.trim()) {
      errorMessage.value = '请输入密码'
      return false
    }
    if (formData.password.length < 6) {
      errorMessage.value = '密码长度不能少于6位'
      return false
    }
    if (!formData.confirmed.trim()) {
      errorMessage.value = '请再次输入密码'
      return false
    }
    if (formData.password !== formData.confirmed) {
      errorMessage.value = '两次输入的密码不一致'
      return false
    }
  } else {
    // 登录模式验证
    if (!formData.username.trim()) {
      errorMessage.value = '请输入用户名'
      return false
    }
    if (!formData.password.trim()) {
      errorMessage.value = '请输入密码'
      return false
    }
    if (formData.password.length < 6) {
      errorMessage.value = '密码长度不能少于6位'
      return false
    }
  }
  errorMessage.value = ''
  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return

  loading.value = true
  errorMessage.value = ''

  try {
    const controller = new AbortController()
    const signal = controller.signal

    let response = null

    if (isRegisterMode.value) {
      // 注册逻辑
      response = await register({
        email: formData.email,
        password: formData.password,
        confirmed: formData.confirmed
      })
    } else {
      // 登录逻辑
      response = await login({
        username: formData.username,
        password: formData.password
      })
    }

    // 统一处理成功逻辑
    const { accessToken, expiresAt, user } = response.data
    setUserInfo(user)
    setToken(accessToken, expiresAt)

    // 跳转到首页
    redirectTo?.('/')
  } catch (err) {
    // 统一处理错误
    errorMessage.value = err?.message || '操作失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login {
  width: 100%;
}
.login-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #fff;
  width: 400px;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.login-title {
  text-align: center;
  margin-bottom: 10px;
}

.login-form {
  display: flex;
  flex-direction: column;
}

.login-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.login-item label {
  min-width: 70px;
  margin-bottom: 5px;
  font-weight: bold;
}

.login-item .input {
  flex: 1 0 auto;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  input {
    flex: 1 0 auto;
  }
}

.toggle-password {
  margin-left: 8px;
  cursor: pointer;
  font-style: normal;
  user-select: none;
  font-size: 18px;
  &:hover {
    opacity: 0.7;
  }
}

.error-message {
  color: #e74c3c;
  font-size: 14px;
  margin-bottom: 10px;
  text-align: center;
}

button {
  padding: 10px;
  background: var(--xh-bg-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background: var(--xh-bg-hover-color);
  }
}
.register {
  text-align: center;
  margin-top: 10px;
  color: var(--xh-text-color);
}
</style>