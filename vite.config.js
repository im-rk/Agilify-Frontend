import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    port: 5173,
    // Keycloak only allows http://localhost:5173/* as a redirect URI — if Vite silently moved to
    // 5174 because 5173 was busy, login would fail with "Invalid parameter: redirect_uri".
    strictPort: true,
  },
})
