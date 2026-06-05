# Vue 项目开发规范

---

## 1. 目录结构

```
src/
├── components/          # 公共组件
│   ├── header.vue       # 头部导航组件
│   ├── aside.vue        # 侧边栏组件
│   ├── TreeSelect.vue   # 树形选择器（主组件）
│   ├── TreeNode.vue     # 树形节点（子组件）
│   └── MessageBox.vue   # 弹窗组件
├── page/                # 页面视图
│   ├── Home.vue
│   ├── AboutView.vue
│   └── ...
├── stores/              # Pinia 状态管理
│   ├── index.js         # Store 导出入口
│   ├── theme.js         # 主题状态
│   ├── user.js          # 用户状态
│   ├── cart.js          # 购物车状态
│   └── plugins.js       # Store 插件
├── api/                 # API 接口
│   ├── user.js
│   ├── goods.js
│   └── ...
├── utils/               # 工具函数
│   ├── tools.js
│   ├── directives.js
│   └── MessageBox.js
└── assets/
    └── css/
        ├── style.css    # 全局重置样式
        └── theme.css    # CSS 变量/主题配置
```

---

## 2. CSS 变量规范

### 2.1 命名约定

所有 CSS 变量必须使用 `--xh-` 前缀，采用 camelCase 命名：

```css
:root {
  --xh-primary-color: #3384ee;       /* 主色调 */
  --xh-bg-color: #ffffff;            /* 背景色 */
  --xh-text-color: #333333;         /* 文本颜色 */
}
```

### 2.2 主题系统

支持多主题切换，通过 `:root` 选择器区分（**推荐使用 html 元素而非 body**）：

```css
/* 默认主题 */
:root {
  --xh-primary-color: #3384ee;
  --xh-bg-color: #ffffff;
  --xh-text-color: #333333;
}

/* green 主题 */
:root.green {
  --xh-primary-color: #73c448;
  --xh-bg-color: #f6ffed;
  --xh-text-color: #262626;
}

/* dark 主题 */
:root.dark {
  --xh-primary-color: #7c9aff;
  --xh-bg-color: #1f1f1f;
  --xh-text-color: #ffffff;
}
```

### 2.3 变量分类

| 分类 | 变量前缀 | 说明 |
|------|---------|------|
| 基础颜色 | `--xh-primary-*` | 主色调相关 |
| 背景颜色 | `--xh-bg-*` | 背景色相关 |
| 文字颜色 | `--xh-text-*` | 文字色相关 |
| 边框颜色 | `--xh-border-*` | 边框色相关 |
| 状态颜色 | `--xh-success-*`, `--xh-error-*`, `--xh-warning-*`, `--xh-info-*` | 状态指示色 |
| 阴影颜色 | `--xh-shadow-*` | 阴影效果色 |
| 交互颜色 | `--xh-hover-*`, `--xh-selected-*` | 交互状态色 |

### 2.4 CSS 工具类（layout）

使用 `@layer` 组织样式，工具类命名采用小写加连字符：

- `flex` / `flexv` - 弹性布局（水平/垂直）
- `flexitem` / `flexitemv` - 弹性子项
- `center` - 水平垂直居中
- `centerv` - 垂直居中
- `centerh` - 水平居中
- `justify` - 两端对齐
- `wrap` - 换行
- `shrink` - 禁止收缩
- `ellipsis` - 单行省略

---

## 3. 组件开发规范

### 3.1 基本结构

```vue
<template>
  <div class="component-name">
    <!-- 组件内容 -->
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  // 属性定义
})

const emit = defineEmits(['event-name'])

// 逻辑代码
</script>

<style scoped>
.component-name {
  /* 组件样式 */
}
</style>
```

### 3.2 命名规范

- **组件文件名**：PascalCase（如 `TreeSelect.vue`）
- **组件类名**：使用组件名作为前缀（如 `.tree-select`）
- **Props 命名**：camelCase（如 `nodeKey`）
- **事件命名**：kebab-case（如 `update:modelValue`）

### 3.3 Props 定义规范

```javascript
const props = defineProps({
  // 必填属性
  node: {
    type: Object,
    required: true
  },
  // 有默认值的属性
  nodeKey: {
    type: String,
    default: 'id'
  },
  // 带验证器的属性
  type: {
    type: String,
    default: '',
    validator: (val) => ['', 'success', 'error', 'warning', 'info'].includes(val)
  }
})
```

### 3.4 事件定义规范

```javascript
const emit = defineEmits([
  'update:modelValue',  // v-model 双向绑定
  'change',            // 值改变事件
  'select',            // 选择事件
  'expand-change'      // 展开/折叠事件
])
```

### 3.5 暴露方法（defineExpose）

```javascript
defineExpose({
  // 方法名使用 camelCase
  getSelectedKeys: () => [...selectedKeys.value],
  expandAll: () => expandAllNodes(props.data),
  collapseAll: () => collapseAllNodes()
})
```

---

## 4. Store 开发规范

### 4.1 基本结构

```javascript
import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    currentTheme: 'default',
    themes: ['default', 'green', 'glory', 'dark']
  }),
  getters: {
    getCurrentTheme: (state) => state.currentTheme,
    getAllThemes: (state) => state.themes
  },
  actions: {
    toggleTheme(themeName = 'default') {
      // 操作逻辑
    }
  }
})
```

### 4.2 Store 命名规范

- **Store 函数名**：`use{ModuleName}Store`（如 `useThemeStore`）
- **Store ID**：小写单数名词（如 `theme`, `user`, `cart`）

### 4.3 State 规范

- 使用 `localStorage` 或 `sessionStorage` 持久化关键数据
- 复杂对象需要序列化存储

### 4.4 Getters 规范

- Getter 命名：`get{PropertyName}`（如 `getCurrentTheme`）
- 仅用于获取/计算状态，不修改状态

### 4.5 Actions 规范

- Action 命名：动词开头（如 `toggleTheme`, `setUserInfo`, `clearUserInfo`）
- 包含完整的业务逻辑
- 处理异步操作（如 API 调用）

---

## 5. API 接口规范

### 5.1 文件结构

```javascript
// src/api/user.js
import request from '@/utils/request'

export const login = (data) => {
  return request({
    url: '/api/login',
    method: 'post',
    data
  })
}

export const logout = () => {
  return request({
    url: '/api/logout',
    method: 'post'
  })
}
```

### 5.2 命名规范

- **函数名**：动词开头（如 `login`, `logout`, `getUserInfo`）
- **参数**：使用对象传参（便于扩展）

---

## 6. 代码风格规范

### 6.1 Vue 模板规范

- 标签属性使用双引号
- 自闭合标签不需要 `/>`（Vue 3）
- 事件处理器使用 `@click` 而非 `v-on:click`
- 指令缩写：`@` 代替 `v-on:`，`:` 代替 `v-bind:`

### 6.2 JavaScript 规范

- 使用 `const` 声明不变变量，`let` 声明可变变量
- 箭头函数优先于普通函数
- 解构赋值优先于链式调用
- 使用 `===` 而非 `==`

### 6.3 注释规范

- 组件 Props 需要添加注释说明用途
- 复杂逻辑需要注释解释
- 不要过度注释（代码应自解释）
- 每个函数需要添加注释说明参数、返回值、异常等

---

## 7. 响应式状态管理

### 7.1 组合式 API 规范

- 使用 `ref` 定义基本类型响应式数据
- 使用 `reactive` 定义对象类型响应式数据
- 使用 `computed` 定义计算属性
- 使用 `watch` 监听数据变化

### 7.2 双向绑定规范

使用 `update:modelValue` 模式：

```javascript
const emit = defineEmits(['update:modelValue'])

// 更新值时
emit('update:modelValue', newValue)
```

---

## 8. 主题切换规范

### 8.1 使用方式

通过 `themeStore.toggleTheme()` 切换主题：

```javascript
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

const handleTheme = (theme) => {
  themeStore.toggleTheme(theme)
}
```

### 8.2 样式使用规范

组件样式必须使用 CSS 变量，禁止硬编码颜色值：

```css
/* ✅ 正确 */
.tree-select {
  border-color: var(--xh-border-color);
  background-color: var(--xh-bg-color);
}

/* ❌ 错误 - 禁止硬编码 */
.tree-select {
  border-color: #d9d9d9;
  background-color: #fff;
}
```

---

## 9. 通用组件模式

### 9.1 MessageBox 组件

提供静态方法调用：

```javascript
import { MessageBox } from '@/utils/MessageBox'

MessageBox.confirm('确定退出登录吗？', '提示').then(() => {
  // 确认操作
}).catch(() => {
  // 取消操作
})
```

### 9.2 TreeSelect 组件

支持单选/多选模式、搜索过滤、自定义渲染：

```vue
<TreeSelect
  v-model="selected"
  :data="treeData"
  :multiple="true"
  :showSearch="true"
/>
```

---

## 10. 性能优化规范

### 10.1 缓存优化

使用 Map 缓存节点映射，避免重复计算：

```javascript
const nodeMapCache = ref(null)

const getNodeMap = () => {
  if (!nodeMapCache.value) {
    nodeMapCache.value = buildNodeMap(props.data)
  }
  return nodeMapCache.value
}
```

---

## 附录：主题变量参考

### 默认主题变量

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `--xh-primary-color` | `#3384ee` | 主色调 |
| `--xh-primary-accent` | `#1890ff` | 强调色 |
| `--xh-primary-hover` | `#40a9ff` | 悬停色 |
| `--xh-bg-color` | `#ffffff` | 主背景色 |
| `--xh-bg-secondary` | `#f5f5f5` | 次背景色 |
| `--xh-bg-tertiary` | `#fafafa` | 三级背景色 |
| `--xh-text-color` | `#333333` | 主文字色 |
| `--xh-text-secondary` | `#666666` | 次文字色 |
| `--xh-text-light` | `#999999` | 浅文字色 |
| `--xh-border-color` | `#d9d9d9` | 边框色 |
| `--xh-border-focus` | `#1890ff` | 焦点边框色 |
| `--xh-success-color` | `#52c41a` | 成功状态色 |
| `--xh-error-color` | `#ff4d4f` | 错误状态色 |
| `--xh-warning-color` | `#faad14` | 警告状态色 |
| `--xh-info-color` | `#1890ff` | 信息状态色 |

---

**文档版本**: v2.0  
**适用项目**: vite-Vue  
**最后更新**: 2026年6月  
**修订说明**: 修正主题 CSS 写法规范，补充变量分类，更新主题切换方式