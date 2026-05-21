import axios from 'axios'
import { RequestHashGenerator, CookieStorage } from '@/utils/tools'

const hashGenerator = new RequestHashGenerator()
const pendingRequestMap = new Map()

const getRequestKey = (config = {}) => {
  const requestParams = { ...(config.params || {}) }

  return hashGenerator.generate({
    method: config.method,
    url: config.url,
    baseURL: config.baseURL,
    params: requestParams,
    data: config.data
  })
}

const removePendingRequest = (config = {}) => {
  const requestKey = getRequestKey(config)
  if (pendingRequestMap.has(requestKey)) {
    pendingRequestMap.delete(requestKey)
  }
}

const addPendingRequest = (config = {}) => {
  const requestKey = getRequestKey(config)

  // 相同请求只保留最新一次，取消旧请求
  if (pendingRequestMap.has(requestKey)) {
    const previousController = pendingRequestMap.get(requestKey)
    previousController.abort('重复请求已取消')
    pendingRequestMap.delete(requestKey)
  }

  const controller = new AbortController()
  config.signal = controller.signal
  pendingRequestMap.set(requestKey, controller)
}

// 创建 axios 实例
const service = axios.create({
  // 开发环境：使用空 baseURL，请求走相对路径，由 Vite 代理处理
  // 生产环境：使用完整的 API URL
  baseURL: import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || 'https://api.example.com'),
  timeout: 15000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json; charset=utf-8'
  }
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 添加认证 token（如果存在）
    const token = CookieStorage.get('token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 添加时间戳防止缓存
    if ((config.method || '').toLowerCase() === 'get') {
      config.params = {
        ...config.params
      }
    }

    addPendingRequest(config)

    return config
  },
  error => {
    // 对请求错误做些什么
    console.error('❌ 请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    // 对响应数据做点什么
    const { config, data, headers, request } = response

    removePendingRequest(config)

    // 根据后端约定的状态码进行处理
    if (response.status !== 200) {
      // 可以在这里统一处理错误提示

      // 如果是 token 过期，跳转到登录页
      if (data.code === 401) {
        sessionStorage.removeItem('token')
      }

      return Promise.reject(new Error(data.message || '请求失败'))
    } else {
      // 返回成功的数据
      return data
    }
  },
  error => {
    // 对响应错误做点什么
    console.error('❌ 响应错误:', error)

    if (error.config) {
      removePendingRequest(error.config)
    }

    if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
      return Promise.reject(new Error('请求已取消'))
    }

    // 处理网络错误
    if (error.response) {
      // 服务器返回了错误状态码
      switch (error.response.status) {
        case 401:
          error.response.message = '🚨 未授权，请重新登录'
          sessionStorage.removeItem('token')
          CookieStorage.remove('token')
          window.location.href = '/login'
          break
        case 403:
          error.response.message = '🚨 拒绝访问'
          break
        case 404:
          error.response.message = '🚨 请求地址出错'
          break
        case 500:
          error.response.message = '🚨 服务器内部错误'
          break
        default:
          console.error(`🚨 错误:${error.response.status}`)
      }
    } else if (error.request) {
      // 网络错误
      error.response.message = '🚨 网络错误，请检查网络连接'
    } else {
      // 其他错误
      console.error('🚨 请求配置错误')
    }

    return Promise.reject(error.response || error)
  }
)

export default service