/**
 * Error handling utilities for SmartScript
 */

/**
 * Custom error class for SmartScript
 */
export class SmartScriptError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = 'SmartScriptError'
    Error.captureStackTrace(this, SmartScriptError)
  }
}

/**
 * Error codes
 */
export const ErrorCodes = {
  CONFIG_INVALID: 'CONFIG_INVALID',
  PATTERN_INVALID: 'PATTERN_INVALID',
  DOM_OPERATION_FAILED: 'DOM_OPERATION_FAILED',
  OBSERVER_FAILED: 'OBSERVER_FAILED',
  PROCESSING_FAILED: 'PROCESSING_FAILED',
} as const

/**
 * Error handler with logging
 */
export function handleError(error: unknown, context: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[SmartScript] ${context}:`, error)
  } else {
    // In production, log less verbose errors
    console.warn(`[SmartScript] ${context}`)
  }
}

/**
 * Safe executor for DOM operations
 */
export function safeExecute<T>(
  operation: () => T,
  fallback: T,
  context: string,
): T {
  try {
    return operation()
  } catch (error) {
    handleError(error, context)
    return fallback
  }
}

/**
 * Async safe executor
 */
export async function safeExecuteAsync<T>(
  operation: () => Promise<T>,
  fallback: T,
  context: string,
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    handleError(error, context)
    return fallback
  }
}

/**
 * Validate and sanitize user input
 */
export function sanitizeSelector(selector: string): string | null {
  try {
    // Test if selector is valid
    document.querySelector(selector)
    return selector
  } catch {
    return null
  }
}

/**
 * Create a timeout wrapper
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutError: Error,
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(timeoutError), timeoutMs),
    ),
  ])
}
