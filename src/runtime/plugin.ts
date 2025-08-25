/**
 * Nuxt SmartScript Plugin
 * Automatic typography transformations for better readability
 */

import type { SuperscriptConfig } from './smartscript'
import { defineNuxtPlugin, nextTick } from '#imports'
import {
  createCombinedPattern,
  createContentObserver,
  createPatterns,
  DEFAULT_CONFIG,
  initializeForNavigation,
  mergeConfig,
  processContent,
  validateConfig,
} from './smartscript'
import { configureLogger, logger } from './smartscript/logger'

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

    logger.debug('Runtime config received:', runtimeConfig)
    logger.debug('Merged config:', config)
    logger.info('Plugin initializing...')

    // Validate configuration
    const errors = validateConfig(config)
    if (errors.length > 0) {
      throw new SmartScriptError(
        `Invalid configuration: ${errors.join(', ')}`,
        'CONFIG_INVALID',
      )
    }
  } catch (error) {
    logger.error('Configuration error:', error)
    // Fall back to default config on error
    config = DEFAULT_CONFIG
    configureLogger(config.debug)
  }

  // Create patterns (using let so they can be reassigned)
  let patterns = createPatterns(config)
  let combinedPattern = createCombinedPattern(patterns, config)

  logger.debug('Patterns created:', {
    copyright: patterns.copyright,
    trademark: patterns.trademark,
    combinedPattern,
  })

  // Check if content was already processed server-side
  const isServerProcessed = () => {
    const metaTag = document.querySelector('meta[name="smartscript-processed"]')
    if (metaTag) {
      logger.info('Found server-processed marker')
    }
    return metaTag !== null
  }

  // Main processing function
  const process = () => {
    try {
      // Skip if already processed server-side UNLESS client is explicitly enabled
      // When both ssr and client are true, we process on both sides (for dynamic content)
      if (isServerProcessed() && config.ssr === true && config.client === false) {
        logger.info('Content already processed server-side, skipping client processing')
        return
      }
      processContent(config, patterns, combinedPattern)
    } catch (error) {
      logger.error('Processing error:', error)
    }
  }

  // Create observer for dynamic content
  let observer: MutationObserver | null = null

  const startObserving = () => {
    if (observer)
      return

    try {
      observer = createContentObserver(process, config)
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      })
    } catch (error) {
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
    logger.debug('app:mounted hook fired')
    logger.debug('config.cssVariables:', config.cssVariables)

    // Apply CSS variables if configured
    if (config.cssVariables && typeof config.cssVariables === 'object') {
      const root = document.documentElement
      logger.debug('Applying CSS variables...')
      Object.entries(config.cssVariables).forEach(([key, value]) => {
        // Ensure key starts with --ss- prefix
        const varName = key.startsWith('--') ? key : `--ss-${key}`
        root.style.setProperty(varName, value)
        logger.debug('CSS variable set:', varName, '→', value)
      })
      logger.debug('CSS variables applied!')
    } else {
      logger.debug('No CSS variables to apply')
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
    } else {
      setTimeout(initialize, config.performance.delay)
    }
  })

  // Handle navigation - use multiple hooks to ensure we catch all navigation scenarios
  nuxtApp.hook('page:finish', async () => {
    logger.debug('page:finish hook - navigation detected')

    initializeForNavigation()

    // Recreate patterns in case something changed
    patterns = createPatterns(config)
    combinedPattern = createCombinedPattern(patterns, config)

    // Wait for Vue to finish its virtual DOM reconciliation
    await nextTick()

    // Add a small delay to ensure all Vue updates are complete
    setTimeout(() => {
      logger.debug('Processing after navigation and Vue reconciliation')
      process()
    }, 50)
  })

  // Also hook into page:transition:finish for when transitions are used
  nuxtApp.hook('page:transition:finish', () => {
    logger.debug('page:transition:finish hook - processing after transition')
    // Process immediately since transition is complete
    process()
  })

  // Also hook into router if available
  if (nuxtApp.$router && typeof nuxtApp.$router === 'object' && 'afterEach' in nuxtApp.$router) {
    const router = nuxtApp.$router as { afterEach: (cb: () => void) => void }
    router.afterEach(async () => {
      logger.debug('Router afterEach - navigation detected')

      initializeForNavigation()

      // Recreate patterns here too
      patterns = createPatterns(config)
      combinedPattern = createCombinedPattern(patterns, config)

      // Wait for Vue's virtual DOM to finish updating
      await nextTick()

      setTimeout(() => {
        logger.debug('Processing after router navigation and Vue reconciliation')
        process()
      }, 100)
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
            patterns = createPatterns(config)
            combinedPattern = createCombinedPattern(patterns, config)

            // Configure logger with new debug setting
            configureLogger(config.debug)

            // Reprocess content
            initializeForNavigation()
            process()

            return true
          } catch (error) {
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
          const superscripts = document.querySelectorAll('.ss-sup, .ss-tm, .ss-reg').length
          const subscripts = document.querySelectorAll('.ss-sub').length
          const trademarks = document.querySelectorAll('.ss-tm').length
          const registered = document.querySelectorAll('.ss-reg').length

          return {
            processedElements: processed,
            superscripts,
            subscripts,
            trademarks,
            registered,
            total: superscripts + subscripts,
          }
        },
      },
    },
  }
})
