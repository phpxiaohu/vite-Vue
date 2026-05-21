import request from '@/plugin/axios.js'
// 登录
const login = (data = {}) => {
  return request({
    url: '/login',
    method: 'post',
    data
  })
}
// 注册
const register = (data = {}) => {
  return request({
    url: '/register',
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

export { login, register, getUser, logout }