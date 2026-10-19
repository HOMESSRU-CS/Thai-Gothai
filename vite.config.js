import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // ตรวจไฟล์เปลี่ยนแบบ polling — กันกรณี Vite ไม่เห็นไฟล์ที่ถูกแก้จากโปรแกรมอื่น แล้วเสิร์ฟโค้ดเก่าค้าง
    watch: { usePolling: true, interval: 300 },
  },
})
