import { createApp, h } from 'vue'
import MessageBoxComponent from '@/components/MessageBox.vue'

const createMessageBox = (options = {}) => {
  return new Promise((resolve, reject) => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    // 弹框是否可见
    let visible = true

    const instance = createApp({
      render() {
        return h(MessageBoxComponent, {
          ...options,
          visible,
          'onUpdate:visible': (val) => {
            visible = val
          },
          onConfirm: () => {
            resolve()
            cleanup()
          },
          onCancel: () => {
            reject()
            cleanup()
          },
          onClose: () => {
            reject()
            cleanup()
          }
        })
      }
    })

    const cleanup = () => {
      setTimeout(() => {
        instance.unmount()
        document.body.removeChild(container)
      }, 300)
    }

    instance.mount(container)
  })
}

// 便捷方法
export const MessageBox = {
  // 提示弹框（只有确定按钮）
  alert: (message, title, options = {}) => {
    return createMessageBox({
      title: title || '提示',
      message,
      showCancelButton: false,
      ...options
    })
  },

  // 确认弹框（有确定和取消按钮）
  confirm: (message, title, options = {}) => {
    return createMessageBox({
      title: title || '提示',
      message,
      showCancelButton: true,
      ...options
    })
  }
}

export default MessageBox