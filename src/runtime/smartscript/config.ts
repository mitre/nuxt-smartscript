/**
 * Configuration management for SmartScript
 */

import type { SuperscriptConfig } from './types'
import { SHARED_DEFAULTS } from '../shared-defaults'

/**
 * CSS class names used by SmartScript (not configurable)
 */
export const CSS_CLASSES = {
  superscript: 'ss-sup',
  subscript: 'ss-sub',
  trademark: 'ss-tm',
  registered: 'ss-reg',
  ordinal: 'ss-ordinal',
  math: 'ss-math',
} as const

/**
 * Default configuration values - uses SHARED_DEFAULTS as single source of truth
 */
export const DEFAULT_CONFIG: SuperscriptConfig = SHARED_DEFAULTS as SuperscriptConfig

/**
 * Merge user configuration with defaults
 */
export function mergeConfig(
  userConfig: Partial<SuperscriptConfig> = {},
): SuperscriptConfig {
  return {
    // Include debug if provided
    ...(userConfig.debug !== undefined && { debug: userConfig.debug }),

    symbols: {
      ...DEFAULT_CONFIG.symbols,
      ...userConfig.symbols,
    },
    selectors: {
      include: userConfig.selectors?.include || DEFAULT_CONFIG.selectors.include,
      exclude: userConfig.selectors?.exclude || DEFAULT_CONFIG.selectors.exclude,
    },
    performance: {
      ...DEFAULT_CONFIG.performance,
      ...userConfig.performance,
    },
    positioning: {
      ...DEFAULT_CONFIG.positioning,
      ...userConfig.positioning,
    },

    // Merge transformations with defaults
    transformations: {
      ...DEFAULT_CONFIG.transformations,
      ...userConfig.transformations,
    },

    // Include optional fields if provided
    ...(userConfig.customPatterns && { customPatterns: userConfig.customPatterns }),
    ...(userConfig.cssVariables && { cssVariables: userConfig.cssVariables }),
  }
}

/**
 * Validate configuration
 */
export function validateConfig(config: SuperscriptConfig): string[] {
  const errors: string[] = []

  // Validate performance settings
  if (config.performance.debounce < 0) {
    errors.push('Debounce value must be non-negative')
  }

  if (config.performance.batchSize < 1) {
    errors.push('Batch size must be at least 1')
  }

  if (config.performance.delay < 0) {
    errors.push('Delay value must be non-negative')
  }

  // Validate selectors
  if (config.selectors.include.length === 0) {
    errors.push('At least one include selector is required')
  }

  return errors
}
