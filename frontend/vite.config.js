import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Dev server config (optional)
    port: 5173,         // change if you want
    strictPort: false,  // let Vite pick the next free port if 5173 is busy

    // Proxy all /api requests to the backend on http://localhost:3000
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // keepDefaults: true, // Vite v5+ only; uncomment if on v5 and you need it
      },
    },
  },
})
