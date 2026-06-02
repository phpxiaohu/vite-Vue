import request from '@/plugin/axios.js'

// 初始化上传
const initUpload = params => {
  return request({
    url: '/upload/init',
    method: 'POST',
    data: params
  })
}

// 上传文件片
const uploadChunk = params => {
  return request({
    url: '/upload/chunk',
    method: 'POST',
    data: params
  })
}

// 合并文件片
const mergeChunks = params => {
  return request({
    url: '/upload/merge',
    method: 'POST',
    data: params
  })
}

// 获取文件列表
const getFilesList = params => {
  return request({
    url: '/upload/files',
    method: 'GET',
    params: params
  })
}

// 删除文件
const deleteFiles = params => {
  return request({
    url: `/upload/files/${params}`,
    method: 'delete'
  })
}

export {
  initUpload,
  uploadChunk,
  mergeChunks,
  getFilesList,
  deleteFiles
}