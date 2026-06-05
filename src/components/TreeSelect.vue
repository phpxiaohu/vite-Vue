<template>
  <div class="tree-select" :class="{ 'is-multiple': multiple, 'is-disabled': disabled }">
    <!-- 搜索框 -->
    <div v-if="showSearch" class="tree-search">
      <input
        v-model="searchKeyword"
        type="text"
        :placeholder="searchPlaceholder"
        class="tree-search-input"
        :disabled="disabled"
        @input="handleSearchInput"
        @keydown.enter="handleSearchEnter"
      />
      <span v-if="searchKeyword" class="tree-search-clear" @click="clearSearch" title="清空">×</span>
      <span v-if="loading" class="tree-search-loading">⏳</span>
    </div>

    <!-- 全选按钮（多选模式） -->
    <div v-if="multiple && showSelectAll" class="tree-select-all">
      <label class="select-all-label">
        <input
          type="checkbox"
          :checked="isAllSelected"
          :indeterminate.prop="isIndeterminate"
          :disabled="disabled"
          @change="handleSelectAll"
        />
        <span>全选</span>
      </label>
    </div>

    <!-- 树形列表 -->
    <div
      ref="treeContainerRef"
      class="tree-container"
      :style="{ maxHeight: height + 'px' }"
      role="tree"
      :aria-multiselectable="multiple"
      @keydown="handleKeydown"
    >
      <!-- 加载状态 -->
      <div v-if="loading && filteredTreeData.length === 0" class="tree-loading">
        <span class="loading-spinner">⏳</span>
        <span>{{ loadingText }}</span>
      </div>

      <!-- 树节点 -->
      <template v-else>
        <TreeNode
          v-for="node in filteredTreeData"
          :key="getNodeKey(node)"
          :node="node"
          :node-key="nodeKey"
          :label-key="labelKey"
          :children-key="childrenKey"
          :multiple="multiple"
          :selected-keys="selectedKeys"
          :expanded-keys="expandedKeys"
          :disabled-keys="disabledKeys"
          :half-checked-keys="halfCheckedKeys"
          :check-strictly="checkStrictly"
          :default-expand-all="defaultExpandAll"
          :indent-size="indentSize"
          :node-render="nodeRender"
          :level="0"
          @select="handleSelect"
          @toggle-expand="handleToggleExpand"
        />
      </template>

      <!-- 空状态 -->
      <div v-if="!loading && filteredTreeData.length === 0" class="tree-empty">
        <slot name="empty">
          <span class="empty-icon">📭</span>
          <p>{{ emptyText }}</p>
        </slot>
      </div>
    </div>

    <!-- 底部统计 -->
    <div v-if="multiple && showSummary" class="tree-summary">
      已选择 <strong>{{ selectedKeys.length }}</strong> 项
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import TreeNode from './TreeNode.vue'
import { debounce } from '@/utils/tools.js'

const props = defineProps({
  // 数据源
  data: {
    type: Array,
    default: () => []
  },
  // 唯一标识字段名
  nodeKey: {
    type: String,
    default: 'id'
  },
  // 显示文本字段名
  labelKey: {
    type: String,
    default: 'label'
  },
  // 子节点字段名
  childrenKey: {
    type: String,
    default: 'children'
  },
  // 是否多选
  multiple: {
    type: Boolean,
    default: false
  },
  // 默认选中的节点
  modelValue: {
    type: [String, Number, Array],
    default: null
  },
  // 是否显示搜索框
  showSearch: {
    type: Boolean,
    default: true
  },
  // 搜索框占位符
  searchPlaceholder: {
    type: String,
    default: '搜索...'
  },

  // 空状态文本
  emptyText: {
    type: String,
    default: '暂无数据'
  },
  // 禁用的节点
  disabledKeys: {
    type: Array,
    default: () => []
  },
  // 是否严格选中（父子不关联）
  checkStrictly: {
    type: Boolean,
    default: false
  },
  // 是否默认展开所有节点
  defaultExpandAll: {
    type: Boolean,
    default: false
  },
  // 组件高度（用于虚拟滚动）
  height: {
    type: Number,
    default: 400
  },
  // 节点缩进大小
  indentSize: {
    type: Number,
    default: 20
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  },
  // 是否显示全选
  showSelectAll: {
    type: Boolean,
    default: false
  },
  // 是否显示统计
  showSummary: {
    type: Boolean,
    default: false
  },
  // 加载状态
  loading: {
    type: Boolean,
    default: false
  },
  // 加载文本
  loadingText: {
    type: String,
    default: '加载中...'
  },
  // 自定义节点渲染函数
  nodeRender: {
    type: Function,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'search', 'expand-change', 'select-all'])

// 搜索关键词
const searchKeyword = ref('')

// 搜索索引（缓存节点信息用于快速搜索）
const searchIndex = ref(null)

// 选中的节点
const selectedKeys = ref([])

// 展开的节点
const expandedKeys = ref([])

// 半选状态的节点
const halfCheckedKeys = ref([])

// 树容器引用
const treeContainerRef = ref(null)

// 处理搜索输入（带防抖）
const handleSearchInput = debounce(() => {
  emit('search', searchKeyword.value)

  if (searchKeyword.value) {
    expandAllNodes(props.data)
  } else if (!props.defaultExpandAll) {
    collapseAllNodes()
  }
}, 300)

// 构建搜索索引
const buildSearchIndex = () => {
  const index = new Map()

  const traverse = (nodes, pathKeys = []) => {
    nodes.forEach(node => {
      const key = getNodeKey(node)
      const label = String(node[props.labelKey] || '').toLowerCase()
      const currentPathKeys = [...pathKeys, key]

      index.set(key, {
        node,
        label,
        pathKeys: currentPathKeys
      })

      const children = node[props.childrenKey] || []
      if (children.length > 0) {
        traverse(children, currentPathKeys)
      }
    })
  }

  traverse(props.data)
  searchIndex.value = index
}

// 清除缓存
const clearCaches = () => {
  nodeMapCache.value = null
  searchIndex.value = null
}

// 根据选中的keys重建树结构（只保留匹配的节点及其完整子树）
const rebuildTreeWithKeys = (matchedKeys) => {
  const keySet = new Set(matchedKeys)

  const buildTree = (nodes) => {
    return nodes.reduce((result, node) => {
      const key = getNodeKey(node)
      const children = node[props.childrenKey] || []

      // 检查当前节点是否匹配
      const isMatched = keySet.has(key)

      // 如果当前节点匹配，保留该节点及其所有子节点
      if (isMatched) {
        result.push({
          ...node,
          [props.childrenKey]: children
        })
      } else {
        // 如果当前节点不匹配，递归检查子节点
        const filteredChildren = children.length ? buildTree(children) : []
        // 如果子节点中有匹配的，保留当前节点作为父容器
        if (filteredChildren.length) {
          result.push({
            ...node,
            [props.childrenKey]: filteredChildren
          })
        }
      }

      return result
    }, [])
  }

  return buildTree(props.data)
}

// 过滤后的树形数据
const filteredTreeData = computed(() => {
  if (!searchKeyword.value) {
    return props.data
  }

  // 延迟构建索引
  if (!searchIndex.value) {
    buildSearchIndex()
  }

  const keyword = searchKeyword.value.toLowerCase()

  // 快速查找匹配节点
  const matchedKeys = []
  searchIndex.value.forEach((info, key) => {
    if (info.label.includes(keyword)) {
      matchedKeys.push(key)
    }
  })

  // 重建树结构
  return rebuildTreeWithKeys(matchedKeys)
})

// 回车搜索
const handleSearchEnter = () => {
  handleSearchInput.cancel()
  emit('search', searchKeyword.value)

  if (searchKeyword.value) {
    expandAllNodes(props.data)
  } else if (!props.defaultExpandAll) {
    collapseAllNodes()
  }
}

// 清空搜索
const clearSearch = () => {
  searchKeyword.value = ''
  handleSearchInput.cancel()
  emit('search', '')

  if (!props.defaultExpandAll) {
    collapseAllNodes()
  }
}

// 获取节点 key
const getNodeKey = (node) => {
  return node[props.nodeKey] || node[props.labelKey]
}

// 初始化选中值
const initSelectedKeys = () => {
  if (props.multiple) {
    selectedKeys.value = Array.isArray(props.modelValue) ? [...props.modelValue] : []
  } else {
    selectedKeys.value = props.modelValue ? [props.modelValue] : []
  }
  updateHalfCheckedKeys()
}

// 监听 modelValue 变化
watch(() => props.modelValue, () => {
  initSelectedKeys()
}, { immediate: true })

// 监听数据变化，清理缓存并重新计算半选状态
watch(() => props.data, () => {
  clearCaches()
  updateHalfCheckedKeys()
}, { deep: true })



// 根据 key 获取节点名称
const getNodeLabel = (key) => {
  const nodeMap = getNodeMap()
  const info = nodeMap.get(key)
  if (info && info.node) {
    return info.node[props.labelKey]
  }
  return key
}

// 移除单个节点
const removeNode = (key) => {
  if (props.disabled) return

  const index = selectedKeys.value.indexOf(key)
  if (index > -1) {
    selectedKeys.value.splice(index, 1)

    // 更新半选状态
    updateHalfCheckedKeys()

    emit('update:modelValue', [...selectedKeys.value])
    emit('change', [...selectedKeys.value], null)
  }
}

// 展开所有节点
const expandAllNodes = (nodes) => {
  const keys = []
  const collectKeys = (items) => {
    items.forEach(node => {
      const children = node[props.childrenKey] || []
      if (children.length > 0) {
        keys.push(node[props.nodeKey])
        collectKeys(children)
      }
    })
  }
  collectKeys(nodes)
  expandedKeys.value = [...new Set([...expandedKeys.value, ...keys])]
}

// 折叠所有节点
const collapseAllNodes = () => {
  expandedKeys.value = []
}

// 处理节点选择
const handleSelect = (node, isSelected) => {
  if (props.disabled) return

  const key = getNodeKey(node)

  // 统一转换为字符串后比较
  if (props.disabledKeys.map(k => String(k)).includes(key)) return

  if (props.multiple) {
    // 如果不严格选中，处理父子节点关联（会自动包含当前节点）
    if (!props.checkStrictly) {
      handleCheckRelation(node, isSelected)
    } else {
      // 严格模式：只更新当前节点
      if (isSelected) {
        if (!selectedKeys.value.includes(key)) {
          selectedKeys.value.push(key)
        }
      } else {
        const index = selectedKeys.value.indexOf(key)
        if (index > -1) {
          selectedKeys.value.splice(index, 1)
        }
      }
    }

    // 更新半选状态
    updateHalfCheckedKeys()

    emit('update:modelValue', [...selectedKeys.value])
    emit('change', [...selectedKeys.value], node)
  } else {
    // 单选模式
    if (selectedKeys.value[0] !== key) {
      selectedKeys.value = [key]
      emit('update:modelValue', key)
      emit('change', key, node)
    }
  }
}

// 处理父子节点关联（优化：使用 Map 缓存节点关系）
const nodeMapCache = ref(null)

// 构建节点映射缓存
const buildNodeMap = (nodes, parentKey = null) => {
  const map = new Map()
  const traverse = (items, parent) => {
    items.forEach(node => {
      const key = getNodeKey(node)
      map.set(key, { node, parentKey: parent })
      const children = node[props.childrenKey] || []
      if (children.length > 0) {
        traverse(children, key)
      }
    })
  }
  traverse(nodes, parentKey)
  return map
}

// 获取或构建节点映射
const getNodeMap = () => {
  if (!nodeMapCache.value) {
    nodeMapCache.value = buildNodeMap(props.data)
  }
  return nodeMapCache.value
}

// 处理父子节点关联
const handleCheckRelation = (node, isSelected) => {
  const key = getNodeKey(node)
  const children = node[props.childrenKey] || []

  // 创建 disabledKeys 的字符串版本缓存
  const disabledKeysStr = props.disabledKeys.map(k => String(k))

  // 收集所有需要更新的 keys（使用 Set 避免重复）
  const keysToUpdate = new Set(selectedKeys.value)

  // ⭐ 关键：先处理当前节点
  if (isSelected) {
    keysToUpdate.add(key)
  } else {
    keysToUpdate.delete(key)
  }

  // 递归收集所有子节点
  const collectChildren = (nodes, checked) => {
    nodes.forEach(child => {
      const childKey = getNodeKey(child)
      if (!disabledKeysStr.includes(childKey)) {
        if (checked) {
          keysToUpdate.add(childKey)
        } else {
          keysToUpdate.delete(childKey)
        }

        const childChildren = child[props.childrenKey] || []
        if (childChildren.length > 0) {
          collectChildren(childChildren, checked)
        }
      }
    })
  }

  // 收集所有需要更新的子节点
  collectChildren(children, isSelected)

  // 一次性更新 selectedKeys，触发响应式
  selectedKeys.value = [...keysToUpdate]

  // 处理父节点（选中和取消选中都需要向上递归）
  updateParentNode(key, isSelected)
}

// 更新父节点状态
const updateParentNode = (childKey, isSelected) => {
  const nodeMap = getNodeMap()
  const info = nodeMap.get(childKey)
  if (!info || info.parentKey === null) return

  const parentKey = info.parentKey
  const parentNode = nodeMap.get(parentKey)?.node
  if (!parentNode) return

  const siblings = parentNode[props.childrenKey] || []
  const disabledKeysStr = props.disabledKeys.map(k => String(k))
  const allSiblingsSelected = siblings.every(sibling => {
    const siblingKey = getNodeKey(sibling)
    return selectedKeys.value.includes(siblingKey) || disabledKeysStr.includes(siblingKey)
  })

  if (isSelected) {
    // 选中时：如果所有兄弟节点都被选中，选中父节点
    if (allSiblingsSelected) {
      if (!selectedKeys.value.includes(parentKey)) {
        selectedKeys.value.push(parentKey)
      }
    }
  } else {
    // 取消选中时：取消父节点选中状态
    const index = selectedKeys.value.indexOf(parentKey)
    if (index > -1) {
      selectedKeys.value.splice(index, 1)
    }
  }

  // 递归更新上级父节点
  updateParentNode(parentKey, isSelected)
}

// 更新半选状态（支持增量更新）
const updateHalfCheckedKeys = (changedKey = null) => {
  if (!props.multiple || props.checkStrictly) {
    halfCheckedKeys.value = []
    return
  }

  // 如果有明确的变更节点，只更新相关路径
  if (changedKey) {
    updateHalfCheckedForPath(changedKey)
    return
  }

  // 全量更新（初始化时）
  const halfChecked = []

  // 递归检查每个节点的选中状态
  const checkNode = (nodes) => {
    nodes.forEach(node => {
      const key = getNodeKey(node)
      const children = node[props.childrenKey] || []

      if (children.length > 0) {
        // 先递归检查子节点
        checkNode(children)

        const disabledKeysStr = props.disabledKeys.map(k => String(k))
        const availableChildren = children.filter(
          child => !disabledKeysStr.includes(getNodeKey(child))
        )
        const selectedCount = availableChildren.filter(
          child => selectedKeys.value.includes(getNodeKey(child))
        ).length

        // 检查子节点是否有半选状态
        const hasHalfCheckedChild = children.some(
          child => halfCheckedKeys.value.includes(getNodeKey(child))
        )

        // 半选条件：
        // 1. 部分子节点被选中，或者
        // 2. 有子节点处于半选状态
        if ((selectedCount > 0 && selectedCount < availableChildren.length) || hasHalfCheckedChild) {
          halfChecked.push(key)
        }
      }
    })
  }

  checkNode(props.data)
  halfCheckedKeys.value = halfChecked
}

// 增量更新路径上的半选状态
const updateHalfCheckedForPath = (key) => {
  const nodeMap = getNodeMap()
  const updateNode = (nodeKey) => {
    const info = nodeMap.get(nodeKey)
    if (!info) return

    const node = info.node
    const children = node[props.childrenKey] || []

    if (children.length > 0) {
      const disabledKeysStr = props.disabledKeys.map(k => String(k))
      const availableChildren = children.filter(
        child => !disabledKeysStr.includes(getNodeKey(child))
      )
      const selectedCount = availableChildren.filter(
        child => selectedKeys.value.includes(getNodeKey(child))
      ).length

      // 检查子节点是否有半选状态
      const hasHalfCheckedChild = children.some(
        child => halfCheckedKeys.value.includes(getNodeKey(child))
      )

      const keyIndex = halfCheckedKeys.value.indexOf(nodeKey)
      // 半选条件：部分子节点被选中，或者有子节点处于半选状态
      const shouldBeHalfChecked = (selectedCount > 0 && selectedCount < availableChildren.length) || hasHalfCheckedChild

      if (shouldBeHalfChecked && keyIndex === -1) {
        halfCheckedKeys.value.push(nodeKey)
      } else if (!shouldBeHalfChecked && keyIndex !== -1) {
        halfCheckedKeys.value.splice(keyIndex, 1)
      }
    }

    // 递归更新父节点
    if (info.parentKey !== null) {
      updateNode(info.parentKey)
    }
  }

  updateNode(key)
}

// 是否全选
const isAllSelected = computed(() => {
  if (!props.multiple) return false

  const getAllKeys = (nodes) => {
    const keys = []
    const disabledKeysStr = props.disabledKeys.map(k => String(k))
    const traverse = (items) => {
      items.forEach(node => {
        const key = getNodeKey(node)
        if (!disabledKeysStr.includes(key)) {
          keys.push(key)
        }
        const children = node[props.childrenKey] || []
        if (children.length > 0) {
          traverse(children)
        }
      })
    }
    traverse(nodes)
    return keys
  }

  const allKeys = getAllKeys(props.data)
  return allKeys.length > 0 && allKeys.every(key => selectedKeys.value.includes(key))
})

// 是否半选（全选按钮）
const isIndeterminate = computed(() => {
  if (!props.multiple) return false
  return selectedKeys.value.length > 0 && !isAllSelected.value
})

// 处理全选
const handleSelectAll = (e) => {
  const checked = e.target.checked

  const getAllKeys = (nodes) => {
    const keys = []
    const disabledKeysStr = props.disabledKeys.map(k => String(k))
    const traverse = (items) => {
      items.forEach(node => {
        const key = getNodeKey(node)
        if (!disabledKeysStr.includes(key)) {
          keys.push(key)
        }
        const children = node[props.childrenKey] || []
        if (children.length > 0) {
          traverse(children)
        }
      })
    }
    traverse(nodes)
    return keys
  }

  const allKeys = getAllKeys(props.data)

  if (checked) {
    // 全选：设置所有可选节点（创建新数组以触发响应式）
    selectedKeys.value = [...allKeys]
  } else {
    // 取消全选：清空所有选择
    selectedKeys.value = []
  }

  // 清除节点映射缓存，强制重新构建
  nodeMapCache.value = null

  // 更新半选状态
  updateHalfCheckedKeys()

  // 使用 nextTick 确保 DOM 更新后再 emit
  nextTick(() => {
    emit('update:modelValue', props.multiple ? [...selectedKeys.value] : selectedKeys.value[0])
    emit('change', [...selectedKeys.value], null)
    emit('select-all', checked)
  })
}

// 处理节点展开/折叠（优化：使用 Set）
const handleToggleExpand = (key, isExpanded) => {
  const keySet = new Set(expandedKeys.value)

  if (isExpanded) {
    keySet.add(key)
  } else {
    keySet.delete(key)
  }

  expandedKeys.value = [...keySet]
  emit('expand-change', key, isExpanded)
}

// 键盘导航
const handleKeydown = (e) => {
  if (props.disabled) return

  const { key } = e

  // 方向键导航、空格选择等（可扩展）
  switch (key) {
    case 'ArrowDown':
    case 'ArrowUp':
      // TODO: 实现键盘导航
      break
    case ' ':
    case 'Enter':
      // TODO: 实现键盘选择
      break
  }
}

// 暴露方法供外部调用
defineExpose({
  // 获取选中节点的key数组
  getSelectedKeys: () => [...selectedKeys.value],
  // 获取选中节点的完整对象数组
  getSelectedNodes: () => {
    const findNode = (nodes, key) => {
      for (const node of nodes) {
        if (getNodeKey(node) === key) {
          return node
        }
        const children = node[props.childrenKey] || []
        const found = findNode(children, key)
        if (found) return found
      }
      return null
    }
    return selectedKeys.value.map(key => findNode(props.data, key)).filter(Boolean)
  },
  // 获取展开节点的key数组
  getExpandedKeys: () => [...expandedKeys.value],
  // 获取半选状态节点的key数组
  getHalfCheckedKeys: () => [...halfCheckedKeys.value],
  // 展开所有节点
  expandAll: () => expandAllNodes(props.data),
  // 折叠所有节点
  collapseAll: () => collapseAllNodes(),
  // 展开指定节点
  expandNode: (key) => {
    if (!expandedKeys.value.includes(key)) {
      expandedKeys.value.push(key)
    }
  },
  // 折叠指定节点
  collapseNode: (key) => {
    const index = expandedKeys.value.indexOf(key)
    if (index > -1) {
      expandedKeys.value.splice(index, 1)
    }
  },
  // 选中指定节点
  selectNode: (key) => {
    if (props.multiple) {
      if (!selectedKeys.value.includes(key)) {
        selectedKeys.value.push(key)
      }
    } else {
      selectedKeys.value = [key]
    }
    updateHalfCheckedKeys()
    emit('update:modelValue', props.multiple ? [...selectedKeys.value] : key)
  },
  // 取消选中指定节点
  unselectNode: (key) => {
    const index = selectedKeys.value.indexOf(key)
    if (index > -1) {
      selectedKeys.value.splice(index, 1)
    }
    updateHalfCheckedKeys()
    emit('update:modelValue', props.multiple ? [...selectedKeys.value] : null)
  },
  // 清空所有选中状态
  clearSelection: () => {
    selectedKeys.value = []
    halfCheckedKeys.value = []
    emit('update:modelValue', props.multiple ? [] : null)
  },
  // 清空搜索关键词
  clearSearch: () => {
    searchKeyword.value = ''
    handleSearchInput.cancel()
    emit('search', '')
  },
  // 滚动到指定节点
  scrollToNode: (key) => {
    // TODO: 实现滚动到指定节点
    nextTick(() => {
      // 查找节点元素并滚动
    })
  },
  // 刷新组件（清除缓存并重算半选状态）
  refresh: () => {
    // 清除缓存
    nodeMapCache.value = null
    updateHalfCheckedKeys()
  }
})
</script>

<style scoped>
.tree-select {
  width: 100%;
  border: 1px solid var(--xh-border-color);
  border-radius: 4px;
  background-color: var(--xh-bg-color);
  transition: border-color 0.3s;
}

.tree-select:hover:not(.is-disabled) {
  border-color: var(--xh-primary-hover);
}

.tree-select.is-disabled {
  background-color: var(--xh-bg-disabled);
  cursor: not-allowed;
}

.tree-select.is-multiple {
  min-height: 200px;
}

/* 搜索框 */
.tree-search {
  padding: 8px;
  border-bottom: 1px solid var(--xh-border-divider);
  position: relative;
}

.tree-search-input {
  width: 100%;
  padding: 6px 30px 6px 10px;
  border: 1px solid var(--xh-border-input);
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s;
  background-color: var(--xh-bg-input);
  color: var(--xh-text-color);
}

.tree-search-input:focus {
  border-color: var(--xh-border-focus);
}

.tree-search-input:disabled {
  background-color: var(--xh-bg-disabled);
  cursor: not-allowed;
}

.tree-search-clear,
.tree-search-loading {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: var(--xh-text-light);
  font-size: 18px;
  line-height: 1;
}

.tree-search-clear:hover {
  color: var(--xh-text-secondary);
}

.tree-search-loading {
  cursor: default;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: translateY(-50%) rotate(0deg); }
  to { transform: translateY(-50%) rotate(360deg); }
}

/* 全选按钮 */
.tree-select-all {
  padding: 8px 12px;
  border-bottom: 1px solid var(--xh-border-divider);
  background-color: var(--xh-bg-tertiary);
}

.select-all-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  user-select: none;
}

.select-all-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

/* 树容器 */
.tree-container {
  max-height: 400px;
  overflow-y: auto;
  padding: 8px 0;
}

/* 加载状态 */
.tree-loading {
  padding: 40px 20px;
  text-align: center;
  color: var(--xh-text-light);
  font-size: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.loading-spinner {
  font-size: 32px;
  animation: spin 1s linear infinite;
}

/* 空状态 */
.tree-empty {
  padding: 40px 20px;
  text-align: center;
  color: var(--xh-text-light);
  font-size: 14px;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
  opacity: 0.5;
}

.tree-empty p {
  margin: 0;
}

/* 底部统计 */
.tree-summary {
  padding: 8px 12px;
  border-top: 1px solid var(--xh-border-divider);
  background-color: var(--xh-bg-tertiary);
  font-size: 13px;
  color: var(--xh-text-secondary);
  text-align: right;
}

.tree-summary strong {
  color: var(--xh-primary-accent);
  font-weight: 600;
}

/* 滚动条样式 */
.tree-container::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.tree-container::-webkit-scrollbar-thumb {
  background-color: var(--xh-shadow-color);
  border-radius: 3px;
  transition: background-color 0.3s;
}

.tree-container::-webkit-scrollbar-thumb:hover {
  background-color: var(--xh-shadow-hover);
}

.tree-container::-webkit-scrollbar-track {
  background-color: transparent;
}

/* 无障碍焦点样式 */
.tree-container:focus {
  outline: 2px solid var(--xh-border-focus);
  outline-offset: -2px;
}
</style>