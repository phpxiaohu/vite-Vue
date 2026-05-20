import request from '@/plugin/axios.js'
// 登录
const login = (data = {}) => {
  return request({
    url: '/login',  // 如果 baseURL 已包含 /api，这里就不需要再加 /api
    // url: `/api/users/xiaohu`,
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