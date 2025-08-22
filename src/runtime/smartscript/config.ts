/**
 * Configuration management for SmartScript
 */

import type { SuperscriptConfig } from './types'

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: SuperscriptConfig = {
  symbols: {
    trademark: ['™', '(TM)', 'TM'],
    registered: ['®', '(R)'],
    copyright: ['©', '(C)'],
    ordinals: true,
  },
  selectors: {
    include: [
      'main',
      'article',
      '.content',
      '[role="main"]',
      '.prose',
      '.blog-post',
      '.blog-content',
      'section',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'header',
    ],
    exclude: [
      'pre',
      'code',
      'script',
      'style',
      '.no-superscript',
      '[data-no-superscript]',
    ],
  },
  performance: {
    debounce: 100,
    batchSize: 50,
    delay: 1500,
  },
  positioning: {
    trademark: {
      body: '-0.5em',
      headers: '-0.7em',
      fontSize: '0.8em',
    },
    registered: {
      body: '-0.25em',
      headers: '-0.45em',
      fontSize: '0.8em',
    },
    ordinals: {
      fontSize: '0.75em',
    },
    chemicals: {
      fontSize: '0.75em',
    },
  },
}

/**
 * Merge user configuration with defaults
 */
export function mergeConfig(
  userConfig: Partial<SuperscriptConfig> = {},
): SuperscriptConfig {
  return {
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
