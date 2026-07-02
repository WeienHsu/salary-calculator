import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' 讓 build 出來的資源用相對路徑，GitHub Pages 子路徑也能直接使用
export default defineConfig({
  plugins: [react()],
  base: './',
})
