import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),  // Tailwind processes our CSS at build time
  ],
  server: {
    port: 5173,     // dev server port (matches the CORS config in the backend)
    proxy: {
      // Forward /api calls to the FastAPI backend during development
      // e.g. fetch('/api/trips') → http://localhost:8000/api/trips
      '/api': 'http://localhost:8000',
    },
  },
})
