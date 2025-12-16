import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./config/setup.js'],
    coverage: {
      provider: 'istanbul',
    },
  },
})
