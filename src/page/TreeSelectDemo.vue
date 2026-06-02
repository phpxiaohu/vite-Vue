<template>
  <div class="tree-select-demo">
    <h2>树形选择组件演示</h2>

    <!-- 基础用法 - 单选 -->
    <div class="demo-section">
      <h3>1. 基础单选模式</h3>
      <TreeSelect
        v-model="singleValue"
        :data="treeData"
        show-search
        node-key="id"
        label-key="name"
        children-key="children"
        style="width: 300px;"
      />
      <p>选中值: {{ singleValue }}</p>
    </div>

    <!-- 多选模式 -->
    <div class="demo-section">
      <h3>2. 多选模式（带全选）</h3>
      <TreeSelect
        v-model="multipleValue"
        :data="treeData"
        multiple
        show-select-all
        show-summary
        default-expand-all
        node-key="id"
        label-key="name"
        children-key="children"
        style="width: 400px;"
      />
      <p>选中值: {{ JSON.stringify(multipleValue) }}</p>
    </div>

    <!-- 带搜索功能 -->
    <div class="demo-section">
      <h3>3. 带搜索功能</h3>
      <TreeSelect
        v-model="searchValue"
        :data="treeData"
        show-search
        search-placeholder="请输入关键词搜索..."
        node-key="id"
        label-key="name"
        children-key="children"
        style="width: 300px;"
      />
      <p>选中值: {{ searchValue }}</p>
    </div>

    <!-- 默认展开所有节点 -->
    <div class="demo-section">
      <h3>4. 默认展开所有节点</h3>
      <TreeSelect
        v-model="expandValue"
        :data="treeData"
        default-expand-all
        node-key="id"
        label-key="name"
        children-key="children"
        style="width: 300px;"
      />
      <p>选中值: {{ expandValue }}</p>
    </div>

    <!-- 禁用部分节点 -->
    <div class="demo-section">
      <h3>5. 禁用部分节点</h3>
      <TreeSelect
        v-model="disabledValue"
        :data="treeData"
        :disabled-keys="[2, 5]"
        node-key="id"
        label-key="name"
        children-key="children"
        style="width: 300px;"
      />
      <p>选中值: {{ disabledValue }}</p>
    </div>

    <!-- 严格选中模式（父子不关联） -->
    <div class="demo-section">
      <h3>6. 严格选中模式（多选）</h3>
      <TreeSelect
        v-model="strictValue"
        :data="treeData"
        multiple
        check-strictly
        node-key="id"
        label-key="name"
        children-key="children"
        style="width: 300px;"
      />
      <p>选中值: {{ strictValue }}</p>
    </div>

    <!-- 自定义数据字段 -->
    <div class="demo-section">
      <h3>7. 自定义数据字段</h3>
      <TreeSelect
        v-model="customValue"
        :data="customTreeData"
        node-key="key"
        label-key="title"
        children-key="nodes"
        style="width: 300px;"
      />
      <p>选中值: {{ customValue }}</p>
    </div>

    <!-- 通过 ref 调用方法 -->
    <div class="demo-section">
      <h3>8. 通过 ref 调用方法</h3>
      <TreeSelect
        ref="treeSelectRef"
        v-model="refValue"
        :data="treeData"
        multiple
        node-key="id"
        label-key="name"
        children-key="children"
        style="width: 300px;"
      />
      <div class="button-group">
        <button @click="handleGetSelected">获取选中节点</button>
        <button @click="handleExpandAll">展开全部</button>
        <button @click="handleCollapseAll">折叠全部</button>
        <button @click="handleClearSearch">清空搜索</button>
      </div>
      <p>选中值: {{ refValue }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TreeSelect from '@/components/TreeSelect.vue'

// 树形数据
const treeData = ref([
  {
    id: 1,
    name: '前端开发',
    children: [
      {
        id: 2,
        name: 'Vue.js',
        children: [
          { id: 3, name: 'Vue 2.x' },
          { id: 4, name: 'Vue 3.x' }
        ]
      },
      {
        id: 5,
        name: 'React',
        children: [
          { id: 6, name: 'React Hooks' },
          { id: 7, name: 'React Router' }
        ]
      },
      {
        id: 8,
        name: 'Angular'
      }
    ]
  },
  {
    id: 9,
    name: '后端开发',
    children: [
      {
        id: 10,
        name: 'Node.js',
        children: [
          { id: 11, name: 'Express' },
          { id: 12, name: 'Koa' }
        ]
      },
      {
        id: 13,
        name: 'Python',
        children: [
          { id: 14, name: 'Django' },
          { id: 15, name: 'Flask' }
        ]
      }
    ]
  },
  {
    id: 16,
    name: '移动端开发',
    children: [
      { id: 17, name: 'iOS' },
      { id: 18, name: 'Android' },
      { id: 19, name: 'Flutter' }
    ]
  }
])

// 自定义字段数据
const customTreeData = ref([
  {
    key: 'a',
    title: '分类 A',
    nodes: [
      { key: 'a-1', title: '项目 A-1' },
      { key: 'a-2', title: '项目 A-2' }
    ]
  },
  {
    key: 'b',
    title: '分类 B',
    nodes: [
      { key: 'b-1', title: '项目 B-1' },
      { key: 'b-2', title: '项目 B-2' }
    ]
  }
])

// 各种选中值
const singleValue = ref(null)
const multipleValue = ref([])
const searchValue = ref(null)
const expandValue = ref(null)
const disabledValue = ref(null)
const strictValue = ref([])
const customValue = ref(null)
const refValue = ref([])

// TreeSelect ref
const treeSelectRef = ref(null)

// 获取选中节点
const handleGetSelected = () => {
  const selectedNodes = treeSelectRef.value?.getSelectedNodes()
  console.log('选中的节点:', selectedNodes)
  alert(`选中了 ${selectedNodes.length} 个节点`)
}

// 展开全部
const handleExpandAll = () => {
  treeSelectRef.value?.expandAll()
}

// 折叠全部
const handleCollapseAll = () => {
  treeSelectRef.value?.collapseAll()
}

// 清空搜索
const handleClearSearch = () => {
  treeSelectRef.value?.clearSearch()
}
</script>

<style scoped>
.tree-select-demo {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.tree-select-demo h2 {
  margin-bottom: 30px;
  color: #333;
  border-bottom: 2px solid #1890ff;
  padding-bottom: 10px;
}

.demo-section {
  margin-bottom: 40px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
}

.demo-section h3 {
  margin-bottom: 15px;
  color: #666;
  font-size: 16px;
}

.demo-section p {
  margin-top: 10px;
  color: #999;
  font-size: 14px;
}

.button-group {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}

.button-group button {
  padding: 6px 16px;
  border: 1px solid #d9d9d9;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.button-group button:hover {
  color: #1890ff;
  border-color: #1890ff;
}
</style>