import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: {
    // In development the React app proxies /api to the Express server
    proxy: { '/api': { target: process.env.VITE_PROXY_TARGET || 'http://localhost:5000', changeOrigin: true } },
  },
  // Integration tests: need the API running on :5000 with a freshly seeded database (see README)
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{js,jsx}'],
    setupFiles: './src/test/setup.js',
    env: { VITE_API_URL: 'http://localhost:5000/api' },
    testTimeout: 30000,
    hookTimeout: 30000,
    fileParallelism: false,
  },
})
