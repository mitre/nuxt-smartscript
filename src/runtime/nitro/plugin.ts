/**
 * Nitro plugin for server-side and static generation processing
 * Transforms content during SSR and SSG using the same logic as client-side
 */

import type { NitroAppPlugin } from 'nitropack'
import { mergeConfig } from '../smartscript/config'
import { logger } from '../smartscript/logger'
import { createCombinedPattern, createPatterns } from '../smartscript/patterns'
import { transformHTMLContent } from '../smartscript/transformer'

export default <NitroAppPlugin> function (nitro) {
  // Hook into the render:html event for both SSR and SSG
  nitro.hooks.hook('render:html', (html, { event }) => {
    // Get configuration from runtime config
    const config = event.context.$config?.public?.smartscript || {}

    // Skip if SSR processing is disabled
    if (config.ssr === false) {
      logger.debug('[Nitro] SSR processing disabled via config')
      return
    }

    // Skip if already processed (check for marker)
    if (html.head.some((h) => h.includes('smartscript-processed'))) {
      logger.debug('[Nitro] Content already processed, skipping')
      return
    }

    logger.info('[Nitro] Processing HTML for SSR/SSG')

    try {
      // Merge config with defaults
      const mergedConfig = mergeConfig(config)

      // Create patterns from config
      const patterns = createPatterns(mergedConfig)

      // Create combined pattern
      const pattern = createCombinedPattern(patterns, mergedConfig)

      // Transform each body HTML part
      html.body = html.body.map((bodyHtml, index) => {
        logger.debug(`[Nitro] Processing body part ${index + 1}/${html.body.length}`)

        // Skip if it's not HTML content
        if (!bodyHtml || typeof bodyHtml !== 'string') {
          return bodyHtml
        }

        // Transform the HTML content with exclusion selectors from config
        const transformed = transformHTMLContent(bodyHtml, pattern, mergedConfig.selectors.exclude)

        if (transformed !== bodyHtml) {
          logger.debug('[Nitro] Content was transformed')
        }

        return transformed
      })

      // Add CSS variables if configured
      if (config.cssVariables && Object.keys(config.cssVariables).length > 0) {
        const cssVars = Object.entries(config.cssVariables)
          .map(([key, value]) => `--ss-${key}: ${value};`)
          .join(' ')

        // Add CSS variables to head
        html.head.push(`<style>:root { ${cssVars} }</style>`)
        logger.debug('[Nitro] Added CSS variables to head')
      }

      // Mark as processed to avoid double processing
      html.head.push('<meta name="smartscript-processed" content="true">')

      logger.info('[Nitro] HTML processing complete')
    } catch (error) {
      logger.error('[Nitro] Error processing HTML:', error)
      // Don't break the rendering, just log the error
    }
  })
}
