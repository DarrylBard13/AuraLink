import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  root: '.',
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1000
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url))
    }
  }
})