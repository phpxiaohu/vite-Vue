# Railway 部署指南

## 项目已配置完成

本项目已完成 Railway 部署所需的所有配置：

### 新增文件
1. **server.js** - Express 静态文件服务器
2. **railway.json** - Railway 配置文件
3. **railway.toml** - Railway Nixpacks 配置

### 修改文件
1. **package.json** - 添加了 `express` 依赖和 `start` 脚本
2. **.gitignore** - 更新了忽略规则

---

## 部署步骤

### 方法一：通过 GitHub 仓库部署（推荐）

1. **将代码推送到 GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit for Railway deployment"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **在 Railway 上创建新项目**
   - 访问 [https://railway.app](https://railway.app)
   - 登录/注册账号
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择你的仓库

3. **自动部署**
   - Railway 会自动检测配置并开始部署
   - 首次部署可能需要几分钟
   - 部署成功后会生成一个公网 URL

### 方法二：通过 Railway CLI 部署

1. **安装 Railway CLI**
   ```bash
   npm i -g @railway/cli
   ```

2. **登录 Railway**
   ```bash
   railway login
   ```

3. **初始化项目**
   ```bash
   railway init
   ```

4. **部署**
   ```bash
   railway up
   ```

---

## 环境变量配置

如果需要配置环境变量（如 API 地址）：

1. 在 Railway 项目页面，点击 "Variables" 标签
2. 添加需要的环境变量，例如：
   - `PORT` - 端口号（Railway 会自动提供）
   - `VITE_API_BASE_URL` - API 基础地址
   - `NODE_ENV` - 运行环境（production）

---

## 部署验证

部署完成后：

1. 访问 Railway 提供的域名
2. 检查应用是否正常加载
3. 测试路由跳转是否正常
4. 验证 API 请求是否正确

---

## 常见问题

### 1. 路由刷新 404
已在 server.js 中配置，所有路由都会返回 index.html，支持前端路由。

### 2. API 代理问题
生产环境中，Vite 的代理配置不生效。需要：
- 在 `.env.production` 中配置正确的 API 地址
- 或者在 Railway 中设置环境变量 `VITE_API_BASE_URL`

### 3. 构建失败
确保：
- Node.js 版本 >= 20.9.0
- 所有依赖都已正确安装
- 没有 TypeScript 类型错误

### 4. 内存不足
如果 DataScreen 等大文件导致问题，可以：
- 启用代码分割
- 增加 Railway 实例的资源配置

---

## 更新部署

每次推送代码到 main 分支后，Railway 会自动重新部署。

手动触发部署：
```bash
railway up
```

---

## 监控和日志

查看实时日志：
```bash
railway logs
```

或在 Railway 网页控制台的 "Deployments" 标签中查看。