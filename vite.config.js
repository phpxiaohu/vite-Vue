import { defineConfig, loadEnv } from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// 'Darwin' en0 在 macOS 系统上,'Windows_NT' Ethernet 在 Windows系统
import { networkInterfaces, type } from 'os';
const interfaces = networkInterfaces(), key = { Darwin: 'en0', Windows_NT: 'Ethernet' }[type()]
const mac = interfaces[key]?.find(item => item.family === 'IPv4')?.mac || '00:00:00:00:00:00'

// 自定义插件：在生产构建时向 index.html 注入 CDN 脚本
function injectCDNPlugin() {
  return {
    name: 'inject-cdn',
    transformIndexHtml(html, ctx) { // 只在生产构建时注入 CDN
      if (ctx.bundle) {
        const cdnScripts = `<script src="https://cdn.jsdelivr.net/npm/vue@3.5.31/dist/vue.global.min.js"></script>
          <script src="https://cdn.jsdelivr.net/npm/vue-demi@0.14.3/lib/index.iife.min.js"></script> <!-- pinia 源码中引入了 vue-demi 这个包 -->
          <script src="https://cdn.jsdelivr.net/npm/vue-router@4.6.4/dist/vue-router.global.min.js"></script>
          <script src="https://cdn.jsdelivr.net/npm/pinia@3.0.4/dist/pinia.iife.min.js"></script>
          <script src="https://cdn.jsdelivr.net/npm/axios@1.16.1/dist/axios.min.js"></script>`
        // 在 #app div 之后插入 CDN 脚本
        return html.replace('<div id="app" class="flexitem"></div>', `<div id="app" class="flexitem"></div>${cdnScripts}`)
      }
      return html
    }
  }
}

// https://cn.vite.dev/config/
// mode: 'development' | 'production' | 'test'
export default defineConfig(({ mode }) => {
  // 根据当前工作目录中的 `mode` 加载 .env 文件 设置第三个参数为 '' 来加载所有环境变量，而不管是否有 `VITE_` 前缀。
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [vue(), basicSsl(), injectCDNPlugin()],
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
        // 配置请求代理 - 只代理 AJAX 请求（通过请求头判断）
        '^/vite': {
          target: env.VITE_API_URL || 'http://127.0.0.1:8000', // 后端服务实际地址
          changeOrigin: true, // 是否允许跨域
          secure: false, // 如果是 https 接口，需要配置这个参数
          ws: true, // 支持 websocket
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    build: {
      // 调整 chunk size 警告限制，默认是 500kb
      chunkSizeWarningLimit: 1000, // 设置为 1000kb (1MB)
      // 启用 source map
      sourcemap: mode === 'production' ? 'hidden' : true,
      rollupOptions: {
        // 外部化依赖，不打包进 bundle
        external: ['vue', 'vue-demi', 'vue-router', 'pinia', 'axios'],
        output: {
          globals: { // 为外部依赖提供全局变量名
            vue: 'Vue',
            'vue-demi': 'VueDemi',
            'vue-router': 'VueRouter',
            pinia: 'Pinia',
            axios: 'axios'
          },
          // 为 chunk 文件生成 source map
          sourcemap: mode === 'production' ? 'hidden' : true
        }
      }
    }
  }
})