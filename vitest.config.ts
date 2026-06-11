import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// Unit/integration tests run in jsdom. These exercise the pure utilities and the hook's
// wiring. Real-browser behavior (actual print dialogs, iframe rendering) is covered separately
// by the Playwright smoke tests under `e2e/`, which are excluded here.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
  },
})
