import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      // 将所有未匹配的请求代理到ComfyUI服务器
      '/prompt': {
        target: 'http://192.168.88.135:8188', // 直接使用正确的API地址
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path, // 保持路径不变
      },
      '/checkpoints': {
        target: 'http://192.168.88.135:8188',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
      '/view': {
        target: 'http://192.168.88.135:8188',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
      // 添加更多ComfyUI常用端点
      '/queue': {
        target: 'http://192.168.88.135:8188',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
      '/history': {
        target: 'http://192.168.88.135:8188',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
    },
  },
})
