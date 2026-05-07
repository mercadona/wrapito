import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    clearMocks: true,
    environment: 'jsdom',
    setupFiles: ['./config/setup.js', './config/polyfills.js'],
    coverage: {
      provider: 'istanbul',
    },
  },
})
