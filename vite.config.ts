// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Giapha/', // Thay 'gia-pha-ho-ha' bằng tên Repository của bạn trên GitHub
})

