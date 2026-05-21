import request from '@/plugin/axios.js'
// 登录
const login = (data = {}) => {
  return request({
    url: '/api/login',  // Vite 代理会自动去掉 /api 前缀转发到后端
    method: 'post',
    data
  })
}
// 获取用户信息
const getUser = (params = {}) => {
  return request({
    url: '/api/getUser',
    method: 'get',
    params
  })
}
// 登出
const logout = (data = {}) => {
  return request({
    url: '/api/logout',
    method: 'post',
    data
  })
}

export { login, getUser, logout }