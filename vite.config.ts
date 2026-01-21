import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import dts from 'unplugin-dts/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), dts()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['cjs', 'es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
    },
  },
})
