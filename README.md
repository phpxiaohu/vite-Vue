## ⚙️ 环境配置

### 开发环境 (.env.development)
- `VITE_APP_TITLE`: Vite-vue Dev
- `VITE_API_URL`: https://api.github.com

### 生产环境 (.env.production)
- `VITE_APP_TITLE`: Vite-vue Prod
- `VITE_API_URL`: https://api.github.com

### Vite 配置亮点
- 支持 HTTPS 开发（basic-ssl 插件）
- 自动获取本地 IP 地址
- 路径别名配置（`@` 指向 `src` 目录）
- 根据环境变量动态设置端口

## 🎨 UI 特性

项目实现了完整的布局系统：
- 可折叠侧边栏（支持展开/收起）
- 顶部导航栏（含主题切换下拉框）
- 主内容区域（支持 loading 状态）
- 底部栏
- 响应式弹性布局（flexbox）
- CSS 滚动时间线动画（scroll timeline）

## 🔐 安全特性

- 路由权限控制
- Token 认证机制
- 请求签名生成
- XSS 防护（noscript 标签）
- 移动端视口限制

## 📝 注意事项

1. 项目使用 ES Modules（`"type": "module"`）
2. 所有页面组件都使用了 `<script setup>` 语法
3. 主题切换会持久化到 localStorage
4. 用户信息存储在 sessionStorage 中
5. 请求超时时间设置为 15 秒
6. 支持取消重复请求，避免资源浪费

## 🌟 推荐 IDE 支持

- Visual Studio Code + Vue Language Features (Volar) 扩展
- 查看 [Vue 官方工具指南](https://vuejs.org/guide/scaling-up/tooling.html#ide-support) 了解更多 IDE 支持选项