import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor':  ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor':     ['lucide-react', 'react-helmet-async'],
        },
      },
    },
    minify: 'esbuild',
    target: 'es2020',
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
})
