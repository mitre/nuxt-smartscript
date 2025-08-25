/**
 * SmartScript - Smart typography transformations
 *
 * This module provides automatic text transformations for:
 * - Trademark and registered symbols
 * - Ordinal numbers
 * - Chemical formulas
 * - Mathematical notation
 */

// Export configuration
export {
  CSS_CLASSES,
  DEFAULT_CONFIG,
  mergeConfig,
  validateConfig,
} from './config'

// Export DOM utilities
export {
  createFragmentFromParts,
  createSubscriptElement,
  createSuperscriptElement,
  isProcessed,
  markAsProcessed,
  resetProcessingFlags,
  shouldExcludeElement,
  shouldIncludeElement,
} from './dom'

// Export engine
export {
  createContentObserver,
  createDebouncedProcessor,
  initializeForNavigation,
  processContent,
  processElement,
  processTextNode,
} from './engine'

// Export logger
export {
  configureLogger,
  logger,
  LogLevel,
} from './logger'

// Export patterns
export {
  createCombinedPattern,
  createPatterns,
  PatternExtractors,
  PatternMatchers,
} from './patterns'

// Export processor
export {
  clearProcessingCaches,
  needsProcessing,
  processMatch,
  processText,
} from './processor'

// Export types
export type {
  PatternSet,
  ProcessingOptions,
  ProcessingResult,
  SuperscriptConfig,
  TextPart,
} from './types'
