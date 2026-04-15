import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  // Esto evita que Vite intente procesar scripts externos del index.html
  appType: 'spa'
})
