/**
 * Global test setup for Vitest
 * This file runs once before all tests
 */

import { afterAll, beforeAll } from 'vitest'

// Global setup that runs once before all test files
beforeAll(() => {
  // Set test environment variables if needed
  process.env.NODE_ENV = 'test'

  // Suppress console logs during tests unless debugging
  if (!process.env.DEBUG) {
    global.console.log = () => {}
    global.console.debug = () => {}
  }
})

// Global cleanup that runs once after all test files
afterAll(() => {
  // Restore console if it was suppressed
  if (!process.env.DEBUG) {
    // eslint-disable-next-line ts/no-explicit-any
    delete (global.console as any).log
    // eslint-disable-next-line ts/no-explicit-any
    delete (global.console as any).debug
  }
})
