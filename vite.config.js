import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    // 같은 와이파이에 붙은 실제 폰에서 접속해 확인하려고 LAN에 노출한다.
    host: true,
    // 카카오 JS 키에 등록된 도메인이 http://localhost:5173 뿐이라,
    // 다른 포트로 밀려나면 도메인 불일치로 지도가 로드되지 않는다.
    // 포트가 점유돼 있으면 조용히 넘어가지 말고 실패시켜 알아채게 한다.
    port: 5173,
    strictPort: true,
  },
})
