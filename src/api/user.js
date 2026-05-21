import request from '@/plugin/axios.js'
// 登录
const login = (data = {}) => {
  return request({
    url: '/login',  // 简洁路径，Vite 代理会自动添加 /api 前缀
    method: 'post',
    data
  })
}
// 获取用户信息
const getUser = (params = {}) => {
  return request({
    url: '/getUser',
    method: 'get',
    params
  })
}
// 登出
const logout = (data = {}) => {
  return request({
    url: '/logout',
    method: 'post',
    data
  })
}

export { login, getUser, logout }