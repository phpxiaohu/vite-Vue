<template>
  <Teleport to="body">
    <Transition name="messagebox-fade">
      <div v-if="visible" class="messagebox-overlay" @click.self="handleOverlayClick">
        <div class="messagebox-container" :style="{ width: width }">
          <!-- 标题栏 -->
          <div v-if="title || showClose" class="messagebox-header">
            <span class="messagebox-title">{{ title }}</span>
            <button
              v-if="showClose"
              class="messagebox-close"
              @click="handleClose"
              aria-label="关闭"
            >×</button>
          </div>

          <!-- 内容区域 -->
          <div class="messagebox-content">
            <!-- 图标 -->
            <div v-if="type" class="messagebox-icon" :class="`messagebox-icon--${type}`">
              <span v-if="type === 'success'">✓</span>
              <span v-else-if="type === 'error'">✕</span>
              <span v-else-if="type === 'warning'">!</span>
              <span v-else-if="type === 'info'">i</span>
            </div>

            <!-- 消息内容 -->
            <div class="messagebox-message">
              <slot>
                <p>{{ message }}</p>
              </slot>
            </div>
          </div>

          <!-- 按钮区域 -->
          <div class="messagebox-footer">
            <button
              v-if="showCancelButton"
              class="messagebox-btn messagebox-btn-cancel"
              @click="handleCancel"
            >
              {{ cancelButtonText }}
            </button>
            <button
              v-if="showConfirmButton"
              class="messagebox-btn messagebox-btn-confirm"
              @click="handleConfirm"
              :disabled="confirmLoading"
            >
              {{ confirmLoading ? '处理中...' : confirmButtonText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '提示'
  },
  message: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: '', // success, error, warning, info
    validator: (val) => ['', 'success', 'error', 'warning', 'info'].includes(val)
  },
  width: {
    type: String,
    default: '420px'
  },
  showClose: {
    type: Boolean,
    default: true
  },
  closeOnClickModal: {
    type: Boolean,
    default: true
  },
  showCancelButton: {
    type: Boolean,
    default: false
  },
  showConfirmButton: {
    type: Boolean,
    default: true
  },
  cancelButtonText: {
    type: String,
    default: '取消'
  },
  confirmButtonText: {
    type: String,
    default: '确定'
  },
  confirmLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'confirm', 'cancel', 'close'])

const handleOverlayClick = () => {
  if (props.closeOnClickModal) {
    handleClose()
  }
}

const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}

const handleCancel = () => {
  emit('update:visible', false)
  emit('cancel')
}

const handleConfirm = () => {
  emit('confirm')

  // 如果没有设置 loading，自动关闭
  if (!props.confirmLoading) {
    emit('update:visible', false)
  }
}
</script>

<style scoped>
.messagebox-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.messagebox-container {
  background: var(--xh-bg-card);
  border-radius: 8px;
  box-shadow: var(--xh-shadow-color);
  overflow: hidden;
  animation: messagebox-zoom-in 0.3s ease;
}

.messagebox-header {
  padding: 20px 20px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--xh-border-divider);
}

.messagebox-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--xh-text-color);
}

.messagebox-close {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--xh-text-light);
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: color 0.3s;
}

.messagebox-close:hover {
  color: var(--xh-text-color);
}

.messagebox-content {
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.messagebox-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  color: #fff;
}

.messagebox-icon--success {
  background-color: var(--xh-success-color);
}

.messagebox-icon--error {
  background-color: var(--xh-error-color);
}

.messagebox-icon--warning {
  background-color: var(--xh-warning-color);
}

.messagebox-icon--info {
  background-color: var(--xh-info-color);
}

.messagebox-message {
  flex: 1;
  font-size: 14px;
  color: var(--xh-text-secondary);
  line-height: 1.6;
}

.messagebox-message p {
  margin: 0;
}

.messagebox-footer {
  padding: 10px 20px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.messagebox-btn {
  padding: 8px 20px;
  font-size: 14px;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.3s;
  outline: none;
}

.messagebox-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.messagebox-btn-cancel {
  background: var(--xh-bg-card);
  border-color: var(--xh-border-color);
  color: var(--xh-text-secondary);
}

.messagebox-btn-cancel:hover:not(:disabled) {
  color: var(--xh-primary-accent);
  border-color: var(--xh-primary-accent);
}

.messagebox-btn-confirm {
  background: var(--xh-primary-accent);
  color: var(--xh-text-white);
}

.messagebox-btn-confirm:hover:not(:disabled) {
  background: var(--xh-primary-hover);
}

/* 动画 */
.messagebox-fade-enter-active,
.messagebox-fade-leave-active {
  transition: opacity 0.3s ease;
}

.messagebox-fade-enter-from,
.messagebox-fade-leave-to {
  opacity: 0;
}

@keyframes messagebox-zoom-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>