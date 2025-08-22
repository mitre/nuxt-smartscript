/**
 * SmartScript - Smart typography transformations
 *
 * This module provides automatic text transformations for:
 * - Trademark and registered symbols
 * - Ordinal numbers
 * - Chemical formulas
 * - Mathematical notation
 */

// Export types
export type {
  SuperscriptConfig,
  TextPart,
  PatternSet,
  ProcessingResult,
  ProcessingOptions,
} from './types'

// Export configuration
export {
  DEFAULT_CONFIG,
  mergeConfig,
  validateConfig,
} from './config'

// Export patterns
export {
  createPatterns,
  createCombinedPattern,
  PatternMatchers,
  PatternExtractors,
} from './patterns'

// Export DOM utilities
export {
  createSuperscriptElement,
  createSubscriptElement,
  createFragmentFromParts,
  shouldExcludeElement,
  shouldIncludeElement,
  isProcessed,
  markAsProcessed,
  resetProcessingFlags,
} from './dom'

// Export processor
export {
  processMatch,
  processText,
  needsProcessing,
  clearProcessingCaches,
} from './processor'

// Export engine
export {
  processTextNode,
  processElement,
  processContent,
  initializeForNavigation,
  createDebouncedProcessor,
  createContentObserver,
} from './engine'

// Export logger
export {
  logger,
  configureLogger,
  LogLevel,
} from './logger'
