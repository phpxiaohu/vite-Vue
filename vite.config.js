import { defineConfig, loadEnv } from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// 'Darwin' en0 在 macOS 系统上,'Windows_NT' Ethernet 在 Windows系统
import { networkInterfaces, type } from 'os';
const interfaces = networkInterfaces(), key = { Darwin: 'en0', Windows_NT: 'Ethernet' }[type()]
const mac = interfaces[key]?.find(item => item.family === 'IPv4')?.mac || '00:00:00:00:00:00'

// https://cn.vite.dev/config/
// mode: 'development' | 'production' | 'test'
export default defineConfig(({ mode }) => {
  // 根据当前工作目录中的 `mode` 加载 .env 文件 设置第三个参数为 '' 来加载所有环境变量，而不管是否有 `VITE_` 前缀。
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [vue(), basicSsl()],
    // base:loadEnv(mode, process.cwd()).VITE_APP_NAME,
    publicDir: 'public',
    define: {
      // 提供从 env var 派生的显式应用程序级常量。
      APP_MAC: JSON.stringify(mac)
    },
    // 例如：使用 env var 有条件地设置开发服务器端口。
    server: {
      port: env.APP_PORT ? Number(env.APP_PORT) : 5173,
      https: false,
      proxy: {
        // 配置请求代理 - 代理所有 API 请求
        '/api': {
          target: env.VITE_API_URL || 'http://127.0.0.1:8000', // 后端服务实际地址
          changeOrigin: true, // 是否允许跨域
          secure: false, // 如果是 https 接口，需要配置这个参数
          ws: true, // 支持 websocket
          rewrite: (path) => path.replace(/^\/api/, '') // ⭐ 关键：去掉 /api 前缀
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    }
  }
})