/**
 * Nuxt SmartScript Plugin
 * Automatic typography transformations for better readability
 */

import { defineNuxtPlugin } from '#app'
import type { SuperscriptConfig } from './smartscript'
import {
  DEFAULT_CONFIG,
  mergeConfig,
  validateConfig,
  createPatterns,
  createCombinedPattern,
  processContent,
  initializeForNavigation,
  createContentObserver,
} from './smartscript'
import { logger, configureLogger } from './smartscript/logger'

// Plugin error class for better error handling
class SmartScriptError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message)
    this.name = 'SmartScriptError'
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  // Initialize configuration
  let config: SuperscriptConfig

  try {
    // Get runtime config or use defaults
    const runtimeConfig = nuxtApp.$config?.public?.smartscript || {}
    config = mergeConfig(runtimeConfig)

    // Configure logger based on debug setting
    configureLogger(config.debug)
    logger.info('Plugin initializing...')

    // Validate configuration
    const errors = validateConfig(config)
    if (errors.length > 0) {
      throw new SmartScriptError(
        `Invalid configuration: ${errors.join(', ')}`,
        'CONFIG_INVALID',
      )
    }
  }
  catch (error) {
    logger.error('Configuration error:', error)
    // Fall back to default config on error
    config = DEFAULT_CONFIG
    configureLogger(config.debug)
  }

  // Create patterns
  const patterns = createPatterns(config)
  const combinedPattern = createCombinedPattern(patterns, config)

  logger.debug('Patterns created:', {
    copyright: patterns.copyright,
    trademark: patterns.trademark,
    combinedPattern,
  })

  // Main processing function
  const process = () => {
    try {
      processContent(config, patterns, combinedPattern)
    }
    catch (error) {
      logger.error('Processing error:', error)
    }
  }

  // Create observer for dynamic content
  let observer: MutationObserver | null = null

  const startObserving = () => {
    if (observer) return

    try {
      observer = createContentObserver(process, config)
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      })
    }
    catch (error) {
      logger.error('Observer error:', error)
    }
  }

  const stopObserving = () => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  // Initialize on app mount
  nuxtApp.hook('app:mounted', () => {
    // Apply CSS variables if configured
    if (config.cssVariables && typeof config.cssVariables === 'object') {
      const root = document.documentElement
      Object.entries(config.cssVariables).forEach(([key, value]) => {
        // Ensure key starts with --ss- prefix
        const varName = key.startsWith('--') ? key : `--ss-${key}`
        root.style.setProperty(varName, value)
        logger.debug('CSS variable set:', varName, '→', value)
      })
    }

    // Use requestIdleCallback for better performance
    const initialize = () => {
      process()
      startObserving()
    }

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(
        () => {
          setTimeout(initialize, 100)
        },
        { timeout: config.performance.delay },
      )
    }
    else {
      setTimeout(initialize, config.performance.delay)
    }
  })

  // Handle navigation
  nuxtApp.hook('page:finish', () => {
    initializeForNavigation()
    setTimeout(process, 100)
  })

  // Also hook into router if available
  if (nuxtApp.$router && typeof nuxtApp.$router === 'object' && 'afterEach' in nuxtApp.$router) {
    const router = nuxtApp.$router as { afterEach: (cb: () => void) => void }
    router.afterEach(() => {
      initializeForNavigation()
      setTimeout(process, 150)
    })
  }

  // Cleanup on unmount
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      stopObserving()
    })
  }

  // Provide public API
  return {
    provide: {
      smartscript: {
        // Process content manually
        process,

        // Control observer
        startObserving,
        stopObserving,

        // Get configuration
        getConfig: () => config,

        // Update configuration at runtime
        updateConfig: (newConfig: Partial<SuperscriptConfig>) => {
          try {
            config = mergeConfig({ ...config, ...newConfig })
            const errors = validateConfig(config)

            if (errors.length > 0) {
              throw new SmartScriptError(
                `Invalid configuration: ${errors.join(', ')}`,
                'CONFIG_INVALID',
              )
            }

            // Recreate patterns with new config
            const newPatterns = createPatterns(config)
            const newCombinedPattern = createCombinedPattern(newPatterns, config)

            // Update closures
            Object.assign(patterns, newPatterns)
            combinedPattern.source = newCombinedPattern.source
            combinedPattern.flags = newCombinedPattern.flags

            // Reprocess content
            initializeForNavigation()
            process()

            return true
          }
          catch (error) {
            logger.error('Configuration update error:', error)
            return false
          }
        },

        // Reset all processing
        reset: () => {
          stopObserving()
          initializeForNavigation()
          startObserving()
        },

        // Get processing statistics
        getStats: () => {
          const processed = document.querySelectorAll('[data-superscript-processed]').length
          const superscripts = document.querySelectorAll('.auto-super').length
          const subscripts = document.querySelectorAll('.auto-sub').length

          return {
            processedElements: processed,
            superscripts,
            subscripts,
            total: superscripts + subscripts,
          }
        },
      },
    },
  }
})
