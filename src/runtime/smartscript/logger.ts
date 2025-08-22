/**
 * Logger utility for SmartScript
 * Uses Nuxt's built-in consola for consistent logging
 */

import { createConsola } from 'consola'

// Create a tagged logger instance for SmartScript
export const logger = createConsola({
  defaults: {
    tag: 'smartscript',
  },
})

// Helper to set log level based on config
export function configureLogger(debug: boolean = false) {
  // In debug mode, show all logs including debug level
  // In production, only show info and above
  logger.level = debug ? 4 : 3  // 4 = debug, 3 = info
}

// Re-export log levels for convenience
export const LogLevel = {
  Fatal: 0,
  Error: 1,
  Warn: 2,
  Info: 3,
  Debug: 4,
  Trace: 5,
} as const