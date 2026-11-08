import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0', // Lắng nghe mọi kết nối từ bên ngoài container Docker
    port: 5173,      // Khớp với port mà bạn đang cấu hình
    allowedHosts: [
      'gruppa.id.vn', // Cho phép tên miền công khai của bạn vượt qua cơ chế chặn host của Vite
    ],
  },
})