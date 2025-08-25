/**
 * Nitro plugin for server-side and static generation processing
 * Uses jsdom for proper DOM manipulation matching client-side behavior
 */

import type { NitroAppPlugin } from 'nitropack'
import type { SuperscriptConfig } from '../smartscript/types'
import { useRuntimeConfig } from '#imports'
import { JSDOM } from 'jsdom'
import { mergeConfig } from '../smartscript/config'
import { processElement } from '../smartscript/engine'
import { logger } from '../smartscript/logger'
import { createCombinedPattern, createPatterns } from '../smartscript/patterns'

export default <NitroAppPlugin> function (nitro) {
  // Hook into the render:html event for both SSR and SSG
  // @ts-expect-error - render:html hook exists but not typed in nitropack
  nitro.hooks.hook('render:html', (html: Record<string, string[]>, { event: _event }: { event: any }) => {
    // Get runtime config using useRuntimeConfig
    const runtimeConfig = useRuntimeConfig()
    const config = runtimeConfig.public?.smartscript as SuperscriptConfig

    // Skip if no config or SSR processing is disabled
    if (!config || config.ssr === false) {
      logger.debug('[Nitro] SSR processing disabled via config')
      return
    }

    // Skip if already processed (check for marker)
    if (html.head?.some((h: string) => h.includes('smartscript-processed'))) {
      logger.debug('[Nitro] Content already processed, skipping')
      return
    }

    logger.info('[Nitro] Processing HTML for SSR/SSG with jsdom')

    try {
      // Merge config with defaults
      const mergedConfig = mergeConfig(config)

      // Create patterns from config
      const patterns = createPatterns(mergedConfig)

      // Create combined pattern
      const pattern = createCombinedPattern(patterns, mergedConfig)

      // Transform each body HTML part using jsdom
      if (html.body) {
        html.body = html.body.map((bodyHtml: string, index: number) => {
          logger.debug(`[Nitro] Processing body part ${index + 1}/${html.body!.length}`)

          // Skip if it's not HTML content
          if (!bodyHtml || typeof bodyHtml !== 'string') {
            return bodyHtml
          }

          // Create a jsdom instance
          const dom = new JSDOM(bodyHtml)
          const document = dom.window.document
          const window = dom.window

          // Make document and window globals available for our processing functions
          const originalDocument = global.document
          const originalWindow = global.window
          const originalNodeFilter = global.NodeFilter
          const originalHTMLElement = global.HTMLElement

          global.document = document as unknown as Document
          global.window = window as unknown as Window & typeof globalThis
          global.NodeFilter = window.NodeFilter as unknown as typeof NodeFilter
          global.HTMLElement = window.HTMLElement as unknown as typeof HTMLElement

          try {
            // Process all matching elements using our existing engine
            const elements = document.querySelectorAll(mergedConfig.selectors.include.join(','))

            elements.forEach((element) => {
              processElement(element, mergedConfig, patterns, pattern)
            })

            // Get the transformed HTML
            const transformed = dom.serialize()

            if (transformed !== bodyHtml) {
              logger.debug('[Nitro] Content was transformed')
            }

            return transformed
          } finally {
            // Restore original globals
            global.document = originalDocument
            global.window = originalWindow
            global.NodeFilter = originalNodeFilter
            global.HTMLElement = originalHTMLElement
          }
        })
      }

      // Add CSS variables if configured
      if (config.cssVariables && Object.keys(config.cssVariables).length > 0) {
        const cssVars = Object.entries(config.cssVariables)
          .map(([key, value]) => `--ss-${key}: ${value};`)
          .join(' ')

        // Add CSS variables to head
        html.head?.push(`<style>:root { ${cssVars} }</style>`)
        logger.debug('[Nitro] Added CSS variables to head')
      }

      // Mark as processed to avoid double processing
      html.head?.push('<meta name="smartscript-processed" content="true">')

      logger.info('[Nitro] HTML processing complete')
    } catch (error) {
      logger.error('[Nitro] Error processing HTML:', error)
      // Don't break the rendering, just log the error
    }
  })
}
