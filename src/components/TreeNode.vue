<template>
  <div
    class="tree-node"
    :style="{ paddingLeft: level * indentSize + 'px' }"
    role="treeitem"
    :aria-expanded="hasChildren ? isExpanded : undefined"
    :aria-selected="isSelected"
  >
  <!-- 节点内容 -->
    <div
      class="tree-node-content"
      :class="{
        'is-selected': isSelected,
        'is-disabled': isDisabled,
        'is-multiple': multiple,
        'is-half-checked': isHalfChecked
      }"
      @click="handleClick"
      role="button"
      :tabindex="isDisabled ? -1 : 0"
    >
      <!-- 展开/折叠图标 -->
      <span
        v-if="hasChildren"
        class="tree-node-expand-icon"
        :class="{ 'is-expanded': isExpanded }"
        @click.stop="handleToggleExpand"
        aria-hidden="true"
      >
        <svg viewBox="0 0 1024 1024" width="12" height="12">
          <path d="M384 192l384 320-384 320z" fill="currentColor" />
        </svg>
      </span>
      <span v-else class="tree-node-indent"></span>

      <!-- 复选框（多选模式） -->
      <input
        v-if="multiple"
        type="checkbox"
        class="tree-node-checkbox"
        :checked="isSelected"
        :indeterminate.prop="isHalfChecked"
        :disabled="isDisabled"
        @click.stop
        @change="handleCheckboxChange"
      />

      <!-- 节点标签（支持自定义渲染） -->
      <span class="tree-node-label">
        <slot name="label" :node="node" :level="level">
          <component
            v-if="nodeRender"
            :is="nodeRender(node, { level, isSelected, isExpanded })"
          />
          <template v-else>{{ node[labelKey] }}</template>
        </slot>
      </span>

      <!-- 额外操作区域（插槽） -->
      <span class="tree-node-extra">
        <slot name="extra" :node="node" :level="level" />
      </span>
    </div>

    <!-- 子节点 -->
    <Transition name="tree-node-expand">
      <div v-if="hasChildren && isExpanded" class="tree-node-children" role="group">
        <TreeNode
          v-for="child in node[childrenKey]"
          :key="getChildKey(child)"
          :node="child"
          :node-key="props.nodeKey"
          :label-key="props.labelKey"
          :children-key="props.childrenKey"
          :multiple="multiple"
          :selected-keys="selectedKeys"
          :expanded-keys="expandedKeys"
          :disabled-keys="disabledKeys"
          :half-checked-keys="halfCheckedKeys"
          :check-strictly="checkStrictly"
          :default-expand-all="defaultExpandAll"
          :indent-size="indentSize"
          :node-render="nodeRender"
          :level="level + 1"
          @select="(node, isSelected) => $emit('select', node, isSelected)"
          @toggle-expand="(key, isExpanded) => $emit('toggle-expand', key, isExpanded)"
        >
          <template #label="slotProps">
            <slot name="label" v-bind="slotProps" />
          </template>
          <template #extra="slotProps">
            <slot name="extra" v-bind="slotProps" />
          </template>
        </TreeNode>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  /** 当前节点数据对象 */
  node: {
    type: Object,
    required: true
  },
  /** 节点唯一标识字段名 */
  nodeKey: {
    type: String,
    default: 'id'
  },
  /** 节点显示文本字段名 */
  labelKey: {
    type: String,
    default: 'label'
  },
  /** 子节点字段名 */
  childrenKey: {
    type: String,
    default: 'children'
  },
  /** 是否多选模式 */
  multiple: {
    type: Boolean,
    default: false
  },
  /** 已选中的节点 key 数组 */
  selectedKeys: {
    type: Array,
    default: () => []
  },
  /** 已展开的节点 key 数组 */
  expandedKeys: {
    type: Array,
    default: () => []
  },
  /** 禁用的节点 key 数组 */
  disabledKeys: {
    type: Array,
    default: () => []
  },
  /** 半选状态的节点 key 数组 */
  halfCheckedKeys: {
    type: Array,
    default: () => []
  },
  /** 是否严格选中（父子节点不关联） */
  checkStrictly: {
    type: Boolean,
    default: false
  },
  /** 是否默认展开所有节点 */
  defaultExpandAll: {
    type: Boolean,
    default: false
  },
  /** 节点缩进大小（像素） */
  indentSize: {
    type: Number,
    default: 20
  },
  /** 自定义节点渲染函数 */
  nodeRender: {
    type: Function,
    default: null
  },
  /** 当前节点层级（从 0 开始） */
  level: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['select', 'toggle-expand'])

// 节点唯一标识
const nodeKey = computed(() => {
  return props.node[props.nodeKey] || props.node[props.labelKey]
})

// 获取子节点 key
const getChildKey = (child) => {
  return child[props.nodeKey] || child[props.labelKey]
}

// 是否有子节点
const hasChildren = computed(() => {
  const children = props.node[props.childrenKey]
  return children && children.length > 0
})

// 是否展开
const isExpanded = computed(() => {
  return props.expandedKeys.includes(nodeKey.value)
})

// 是否选中
const isSelected = computed(() => {
  return props.selectedKeys.includes(nodeKey.value)
})

// 是否禁用
const isDisabled = computed(() => {
  return props.disabledKeys.includes(nodeKey.value)
})

// 是否半选
const isHalfChecked = computed(() => {
  return props.halfCheckedKeys.includes(nodeKey.value)
})

// 点击节点
const handleClick = () => {
  if (isDisabled.value) return

  // 只触发选择，不触发展开/折叠
  emit('select', props.node, !isSelected.value)
}

// 复选框变化
const handleCheckboxChange = (e) => {
  if (!isDisabled.value) {
    emit('select', props.node, e.target.checked)
  }
}

// 切换展开/折叠
const handleToggleExpand = () => {
  if (hasChildren.value) {
    emit('toggle-expand', nodeKey.value, !isExpanded.value)
  }
}
</script>

<style scoped>
.tree-node {
  user-select: none;
}

/* 节点内容 */
.tree-node-content {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 4px;
  margin: 2px 0;
  position: relative;
}

.tree-node-content:hover:not(.is-disabled) {
  background-color: #f5f5f5;
}

.tree-node-content:focus-visible {
  outline: 2px solid #1890ff;
  outline-offset: -2px;
}

.tree-node-content.is-selected {
  background-color: #e6f7ff;
  color: #1890ff;
}

.tree-node-content.is-disabled {
  color: #d9d9d9;
  cursor: not-allowed;
  opacity: 0.6;
}

.tree-node-content.is-half-checked {
  background-color: #f0f9ff;
}

/* 展开图标 */
.tree-node-expand-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  color: #999;
  transition: transform 0.3s;
  cursor: pointer;
  margin-right: 4px;
  flex-shrink: 0;
}

.tree-node-expand-icon:hover {
  color: #666;
}

.tree-node-expand-icon.is-expanded {
  transform: rotate(90deg);
}

/* 占位缩进 */
.tree-node-indent {
  width: 20px;
  display: inline-block;
  flex-shrink: 0;
}

/* 复选框 */
.tree-node-checkbox {
  margin-right: 8px;
  cursor: pointer;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.tree-node-checkbox:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

/* 节点标签 */
.tree-node-label {
  flex: 1;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

/* 额外操作区域 */
.tree-node-extra {
  margin-left: 8px;
  flex-shrink: 0;
}

/* 子节点容器 */
.tree-node-children {
  /* padding-left 由 level * indentSize 控制 */
}

/* 展开/折叠动画 */
.tree-node-expand-enter-active,
.tree-node-expand-leave-active {
  transition: all 0.3s ease;
  max-height: 1000px;
  overflow: hidden;
}

.tree-node-expand-enter-from,
.tree-node-expand-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>