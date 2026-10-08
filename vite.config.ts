import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/Portfolio/',
  appType: 'mpa',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        standard: 'standard/index.html',
        notFound: '404.html',
      },
    },
  },
})
