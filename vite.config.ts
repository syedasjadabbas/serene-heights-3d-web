import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      ignored: ['**/*.mp4', '**/*.webm', '**/*.glb', '**/*.gltf', '**/*.hdr', '**/src/assets/videos/**']
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('three') || id.includes('@react-three')) {
              return 'vendor-three'
            }
            if (id.includes('gsap') || id.includes('lenis')) {
              return 'vendor-animation'
            }
            if (id.includes('react') || id.includes('scheduler')) {
              return 'vendor-react'
            }
          }
        },
      },
    },
  },
})

