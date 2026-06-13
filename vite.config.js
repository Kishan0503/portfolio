import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          particles: ['@tsparticles/react', '@tsparticles/slim'],
          gsap: ['gsap'],
        },
      },
    },
  },
})
