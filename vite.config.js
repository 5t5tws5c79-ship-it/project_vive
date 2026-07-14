import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    // 같은 와이파이에 붙은 실제 폰에서 접속해 확인하려고 LAN에 노출한다.
    host: true,
  },
})
