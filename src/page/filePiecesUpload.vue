<template>
  <div class="filePiecesUpload" v-loading="loading">
    <div class="upload-area">
      <button class="fileBtn"><input type="file" @change="fileChange">选择文件</button>
      <span class="progress-info">上传进度: <progress max="100" :value="progress"></progress>{{ progress }}%</span>
      <button class="fileBtn" @click="getFileList">查询文件列表</button>
    </div>

    <div class="file-list">
      <h3>文件列表</h3>
      <div class="table-container">
        <table>
          <thead>
            <tr><th>用户ID</th><th>原始文件名</th><th>存储文件名</th><th>路径</th><th>URL</th><th>大小</th><th>扩展名</th><th>状态</th><th>操作</th></tr>
          </thead>
          <tbody>
            <tr v-for="(file, index) in fileList" :key="index">
              <td>{{ file.user_id }}</td>
              <td>{{ file.original_name }}</td>
              <td>{{ file.storage_name }}</td>
              <td>{{ file.path }}</td>
              <td><a :href="file.url" target="_blank" class="url-link">查看</a></td>
              <td>{{ formatSize(file.size) }}</td>
              <td>{{ file.extension }}</td>
              <td><span :class="['status', file.status]">{{ getStatusText(file.status) }}</span></td>
              <td><button class="delete-btn" @click="deleteFile(index)">删除</button></td>
            </tr>
            <tr v-if="fileList.length === 0">
              <td colspan="10" class="empty">暂无文件</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { initUpload, uploadChunk, mergeChunks, getFilesList, deleteFiles } from '@/api/filePieces.js'
import { MessageBox } from '@/utils/MessageBox'

const loading = ref(false) // 上传状态
const filePiece = ref([]) // 分片文件
const chunkSize = ref(1024 * 1024) // 切片大小为2M
const progress = ref(0) // 上传进度
const uploadId = ref('') // 上传ID
const filename = ref('') // 文件名
const imgUrl = ref('') // 图片预览URL
const fileList = ref([]) // 文件列表

// 格式化文件大小
const formatSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 删除文件
const deleteFile = (index) => {
  const [{ id }] = fileList.value.splice(index, 1)
  deleteFiles(id)
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    uploading: '上传中',
    completed: '已完成',
    failed: '失败'
  }
  return statusMap[status] || status
}

// 分片计算文件
const readFile = (file) => {
  let index = 0
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    const loadFile = () => {
      if (index >= file.size) {
        return resolve(filePiece.value)
      }
      const slice = file.slice(index, index + chunkSize.value)
      filePiece.value.push(slice)
      fileReader.readAsArrayBuffer(slice)
    }
    fileReader.onload = () => {
      index += chunkSize.value
      loadFile()
    }
    fileReader.onerror = () => {
      reject('读取文件失败')
    }
    loadFile()
  })
}

// 合并文件片
const mergeFile = async () => {
  const { message } = await mergeChunks({
    uploadId: uploadId.value,
    filename: filename.value,
    totalChunks: filePiece.value.length
  })
  getFileList()
  MessageBox.alert(message)
}

// 上传文件
const uploadFile = async (piece) => {
  const total = piece.length

  for (let index = 0; index < total; index++) {
    const formData = new FormData()
    formData.append('uploadId', uploadId.value)
    formData.append('totalChunks', total)
    formData.append('chunkIndex', index)
    formData.append('file', piece[index])

    await uploadChunk(formData).then(() => {
      progress.value = Math.round(((index + 1) / total) * 100)
    })
  }

  await mergeFile()
}

// 初始化上传
const handleInitUpload = async (file) => {
  loading.value = true
  try {
    const { data } = await initUpload({
      filename: file.name,
      size: file.size,
      chunkSize: chunkSize.value
    })
    uploadId.value = data.uploadId
    filename.value = data.filename
  } finally {
    loading.value = false
  }
}

// 选取文件
const fileChange = async ({ target }) => {
  const file = target.files[0]
  if (file) {
    filePiece.value = []
    progress.value = 0
    uploadId.value = ''

    await handleInitUpload(file)
    const piece = await readFile(file)
    await uploadFile(piece)
  }
}

// 获取文件列表
const getFileList = () => {
  loading.value = true
  getFilesList().then(({ data }) => {
    fileList.value = data
  }).finally(() => {
    loading.value = false
  })
}

onMounted(() => {
  getFileList()
})
</script>

<style scoped>
.filePiecesUpload {
  margin: 10px;
}

.upload-area {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.fileBtn {
  position: relative;
  padding: 8px 16px;
  border: 1px solid #409eff;
  border-radius: 4px;
  cursor: pointer;
  background: #409eff;
  color: white;
  font-size: 14px;
}

.fileBtn input[type="file"] {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.progress-info {
  font-size: 14px;
}

.progress-info progress {
  width: 200px;
  margin: 0 8px;
}

.file-list h3 {
  margin-bottom: 10px;
  font-size: 16px;
  color: #333;
}

.file-list .table-container {
  overflow-x: auto;
  max-width: 100%;
}

.file-list table {
  min-width: 100%;
  border-collapse: collapse;
  border: 1px solid #e4e7ed;
}

.file-list th,
.file-list td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e4e7ed;
}

.file-list th {
  background: #f5f7fa;
  font-weight: 600;
  color: #606266;
}

.file-list .status {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.file-list .status.uploading {
  background: #e6f7ff;
  color: #1890ff;
}

.file-list .status.completed {
  background: #f0f9eb;
  color: #67c23a;
}

.file-list .status.failed {
  background: #fef0f0;
  color: #f56c6c;
}

.file-list .url-link {
  color: #409eff;
  text-decoration: none;
}

.file-list .url-link:hover {
  text-decoration: underline;
}

.file-list .empty {
  text-align: center;
  color: #909399;
}

.delete-btn {
  padding: 4px 12px;
  border: none;
  border-radius: 4px;
  background: #f56c6c;
  color: white;
  cursor: pointer;
  font-size: 12px;
}

.delete-btn:hover {
  background: #f78989;
}
</style>