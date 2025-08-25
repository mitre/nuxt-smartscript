import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Global setup file
    setupFiles: ['./test/setup.ts'],

    // Default test environment
    environment: 'jsdom',

    // Test globals
    globals: true,

    // Test timeout
    testTimeout: 30000,

    // Hook timeout
    hookTimeout: 30000,

    // Coverage config
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        'playground/',
        'docs/',
        '.nuxt/',
        'dist/',
      ],
    },

    // Aliases for cleaner imports in tests
    alias: {
      '~': fileURLToPath(new URL('./src', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
