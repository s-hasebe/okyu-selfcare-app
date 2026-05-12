import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    // 開発サーバーのみ HTTPS（スマホ実機テスト用）
    command === 'serve' && basicSsl(),
  ],
  server: {
    host: true,   // LAN上のスマホからアクセス可能（192.168.x.x）
    https: true,  // カメラAPIに必要なHTTPS
  },
}))
