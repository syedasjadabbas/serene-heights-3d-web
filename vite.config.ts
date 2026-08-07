import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      ignored: ['**/*.mp4', '**/*.webm', '**/*.glb', '**/*.gltf', '**/*.hdr', '**/src/assets/videos/**']
    }
  }
})

