import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  build: {
    // Use terser to minify. Vite's default esbuild minifier does not reliably
    // minify the ES (`.mjs`) library output, leaving it larger than the CJS
    // build and retaining comments. terser minifies both formats consistently.
    minify: 'terser',
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['cjs', 'es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
    },
  },
})
