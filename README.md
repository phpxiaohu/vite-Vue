# Vite-Vue 项目

基于 Vue 3 + Vite 构建的现代化前端项目模板，集成了完整的主题系统、状态管理和组件库。

## ✨ 功能特性

### 🎨 UI 组件
- **TreeSelect** - 树形选择器（支持单选/多选、搜索过滤、自定义渲染）
- **MessageBox** - 弹窗组件（支持确认、提示、警告等类型）
- **Header** - 顶部导航栏（含主题切换下拉框）
- **Aside** - 可折叠侧边栏
- **Footer** - 底部栏

### 🎭 主题系统
- 支持 4 种内置主题：default（蓝色）、green（绿色）、glory（金色）、dark（深色）
- CSS 变量驱动，切换即时生效
- 主题配置持久化到 localStorage

### 🔐 安全特性
- 路由权限控制
- Token 认证机制
- 请求签名生成
- XSS 防护

### ⚡ 性能优化
- 请求缓存机制
- 支持取消重复请求
- 异步组件加载

## 🛠️ 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue | 3.5+ | 渐进式 JavaScript 框架 |
| Vite | 6.4+ | 下一代前端构建工具 |
| Pinia | 3.0+ | Vue 状态管理库 |
| Vue Router | 4.6+ | Vue 路由管理器 |
| Axios | 1.15+ | HTTP 客户端 |
| ECharts | 6.0+ | 数据可视化图表库 |

## 📦 安装与运行

### 环境要求
- Node.js >= 20.9.0
- npm >= 10

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 生产构建
```bash
npm run build
```

### 预览构建结果
```bash
npm run preview
```

## 📁 项目结构

```
src/
├── components/          # 公共组件
│   ├── header.vue       # 顶部导航组件
│   ├── aside.vue        # 侧边栏组件
│   ├── TreeSelect.vue   # 树形选择器（主组件）
│   ├── TreeNode.vue     # 树形节点（子组件）
│   └── MessageBox.vue   # 弹窗组件
├── page/                # 页面视图
│   ├── Home.vue         # 首页
│   ├── TreeSelectDemo.vue # TreeSelect 演示页
│   └── ...
├── stores/              # Pinia 状态管理
│   ├── theme.js         # 主题状态
│   ├── user.js          # 用户状态
│   └── cart.js          # 购物车状态
├── api/                 # API 接口
│   ├── user.js          # 用户相关接口
│   └── goods.js         # 商品相关接口
├── utils/               # 工具函数
│   ├── tools.js         # 通用工具函数
│   └── request.js       # 请求封装
├── assets/              # 静态资源
│   └── css/
│       ├── style.css    # 全局重置样式
│       └── theme.css    # CSS 变量/主题配置
└── App.vue              # 根组件
```

### Vite 配置亮点
- 支持 HTTPS 开发（basic-ssl 插件）
- 自动获取本地 IP 地址
- 路径别名配置（`@` 指向 `src` 目录）
- 根据环境变量动态设置端口

## 🎨 主题系统

### 主题列表
| 主题名称 | 说明 | 主色调 |
|----------|------|--------|
| default | 默认主题 | 蓝色 (#3384ee) |
| green | 绿色主题 | 绿色 (#73c448) |
| glory | 金色主题 | 金色 (#dbae58) |
| dark | 深色主题 | 蓝色 (#7c9aff) |

## 📝 开发规范

请参考项目中的 `STYLE_GUIDE.md` 文件，了解详细的开发规范：

- **组件命名**：PascalCase（文件名）+ kebab-case（类名）
- **Props 命名**：camelCase
- **事件命名**：kebab-case
- **样式规范**：使用 CSS 变量，禁止硬编码颜色值

## ⚠️ 注意事项

1. 项目使用 ES Modules（`"type": "module"`）
2. 所有页面组件都使用了 `<script setup>` 语法
3. 主题切换会持久化到 localStorage
4. 用户信息存储在 sessionStorage 中
5. 请求超时时间设置为 15 秒
6. 支持取消重复请求，避免资源浪费

## 🌟 推荐 IDE 支持

- **Visual Studio Code** + **Vue Language Features (Volar)** 扩展
- 查看 [Vue 官方工具指南](https://vuejs.org/guide/scaling-up/tooling.html#ide-support) 了解更多 IDE 支持选项

## 📄 License

MIT License

---

**项目版本**: v1.0  
**最后更新**: 2026年6月